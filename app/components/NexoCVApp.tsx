"use client";

import type { CSSProperties, DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  analyzeCompatibility,
  type MatchResult,
} from "../../lib/matcher";
import { COMPANY_PRIORITIES, COMPANY_SECTORS } from "../../lib/company-catalog";
import {
  OCCUPATIONS,
  createRoleId,
  findOccupation,
} from "../../lib/role-catalog";

type User = {
  displayName: string;
  email: string;
};

type HistoryItem = {
  id: string;
  company: string;
  roleId: string;
  roleLabel: string;
  score: number;
  resumeFilename: string | null;
  createdAt: string;
  result: MatchResult | null;
};

type NexoCVAppProps = {
  user: User | null;
  signInPath: string;
  signOutPath: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function NexoCVApp({ user, signInPath, signOutPath }: NexoCVAppProps) {
  const [company, setCompany] = useState("");
  const [companySectorId, setCompanySectorId] = useState("");
  const [companyPriorityIds, setCompanyPriorityIds] = useState<string[]>([]);
  const [companyDescription, setCompanyDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("Analista de Dados");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formError, setFormError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [resultContext, setResultContext] = useState({ company: "", roleLabel: "", sectorLabel: "" });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(Boolean(user));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/analyses")
      .then(async (response) => {
        if (!response.ok) throw new Error("Histórico indisponível");
        return response.json() as Promise<{ analyses: HistoryItem[] }>;
      })
      .then((payload) => {
        if (active) setHistory(payload.analyses ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function selectFile(file: File) {
    setFormError("");
    setSaveNotice("");
    if (file.size > MAX_FILE_SIZE) {
      setFormError("O currículo precisa ter no máximo 10 MB.");
      return;
    }
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) {
      setFormError("Envie seu currículo em PDF, Word (.docx) ou TXT.");
      return;
    }

    setIsReading(true);
    try {
      const extracted = await extractResumeText(file);
      if (extracted.trim().length < 80) {
        throw new Error("Não foi possível encontrar texto suficiente nesse arquivo.");
      }
      setResumeFile(file);
      setResumeText(extracted.trim());
      setManualOpen(false);
    } catch (error) {
      setResumeFile(null);
      setManualOpen(true);
      setFormError(
        error instanceof Error
          ? `${error.message} Você pode colar o conteúdo do currículo abaixo.`
          : "Não foi possível ler o arquivo. Cole o conteúdo do currículo abaixo.",
      );
    } finally {
      setIsReading(false);
    }
  }

  async function handleAnalyze() {
    setFormError("");
    setSaveNotice("");
    if (!company.trim()) {
      setFormError("Informe o nome da empresa.");
      return;
    }
    if (!companySectorId) {
      setFormError("Selecione o setor da empresa para ele participar da análise.");
      return;
    }
    if (!roleTitle.trim()) {
      setFormError("Informe a profissão ou o cargo da vaga.");
      return;
    }
    const occupation = findOccupation(roleTitle);
    if (!occupation && jobDescription.trim().length < 80) {
      setFormError("Esse cargo é personalizado. Cole ao menos um trecho da descrição da vaga para a comparação ficar correta.");
      return;
    }
    if (companySectorId === "other" && !companyPriorityIds.length && companyDescription.trim().length < 80) {
      setFormError("Para uma empresa multissetorial, selecione uma prioridade ou cole um trecho sobre a empresa.");
      return;
    }
    if (resumeText.trim().length < 120) {
      setFormError("Envie o currículo ou cole pelo menos um trecho completo para analisar.");
      setManualOpen(true);
      return;
    }

    setIsAnalyzing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 520));

    const resolvedRoleId = occupation?.id ?? createRoleId(roleTitle);
    const resolvedRoleLabel = occupation?.title ?? roleTitle.trim();
    const nextResult = analyzeCompatibility({
      resumeText,
      roleId: resolvedRoleId,
      roleTitle: resolvedRoleLabel,
      company: company.trim(),
      companySectorId,
      companyPriorityIds,
      companyDescription,
      jobDescription,
    });
    setResult(nextResult);
    setResultContext({
      company: company.trim(),
      roleLabel: resolvedRoleLabel,
      sectorLabel: nextResult.companyMatch?.sectorLabel ?? "",
    });
    setIsAnalyzing(false);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    if (user) {
      await saveAnalysis(nextResult, resolvedRoleLabel, resolvedRoleId);
    } else {
      setSaveNotice("Resultado pronto. Entre com o ChatGPT para manter esta análise no seu histórico privado.");
    }
  }

  async function saveAnalysis(nextResult: MatchResult, roleLabel: string, resolvedRoleId: string) {
    const form = new FormData();
    form.set("company", company.trim());
    form.set("roleId", resolvedRoleId);
    form.set("roleLabel", roleLabel);
    form.set("result", JSON.stringify(nextResult));
    if (resumeFile) form.set("resume", resumeFile);

    try {
      const response = await fetch("/api/analyses", { method: "POST", body: form });
      const payload = (await response.json()) as { analysis?: HistoryItem; error?: string };
      if (!response.ok || !payload.analysis) throw new Error(payload.error || "Não foi possível salvar agora.");
      setHistory((current) => [payload.analysis as HistoryItem, ...current].slice(0, 20));
      setSaveNotice("Análise salva no seu histórico privado.");
    } catch {
      setSaveNotice("A análise está pronta, mas o histórico não pôde ser atualizado agora.");
    }
  }

  function openHistoryItem(item: HistoryItem) {
    if (!item.result) return;
    setResult(item.result);
    setResultContext({
      company: item.company,
      roleLabel: item.roleLabel,
      sectorLabel: item.result.companyMatch?.sectorLabel ?? "",
    });
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function resetAnalysis() {
    setCompany("");
    setCompanySectorId("");
    setCompanyPriorityIds([]);
    setCompanyDescription("");
    setRoleTitle("Analista de Dados");
    setJobDescription("");
    setResumeText("");
    setResumeFile(null);
    setManualOpen(false);
    setResult(null);
    setFormError("");
    setSaveNotice("");
    fileInputRef.current?.focus();
    document.querySelector("#analisar")?.scrollIntoView({ behavior: "smooth" });
  }

  function shareOnWhatsApp() {
    if (!result) return;
    const message = [
      `Minha análise no NexoCV: ${result.score}% de compatibilidade`,
      `${resultContext.roleLabel} • ${resultContext.company}`,
      resultContext.sectorLabel ? `Contexto: ${resultContext.sectorLabel}` : "",
      result.level,
      "Compare seu currículo antes de se candidatar.",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="NexoCV, início">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NexoCV</span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#seguranca">Segurança</a>
          <a href="#historico">Histórico</a>
        </nav>
        {user ? (
          <div className="account-menu">
            <span className="avatar" aria-hidden="true">{user.displayName.charAt(0).toUpperCase()}</span>
            <span className="account-copy">
              <strong>{firstName(user.displayName)}</strong>
              <small>Conta conectada</small>
            </span>
            <a className="text-button" href={signOutPath}>Sair</a>
          </div>
        ) : (
          <a className="header-cta" href={signInPath}>Entrar</a>
        )}
      </header>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> Análise clara, sem adivinhação</span>
          <h1>Seu currículo está falando a <em>língua da vaga?</em></h1>
          <p>
            Compare experiências, habilidades e palavras-chave. Em poucos instantes,
            entenda onde você combina com a oportunidade e o que ajustar antes de enviar.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#analisar">Analisar meu currículo <span aria-hidden="true">→</span></a>
            <a className="secondary-link" href="#como-funciona"><span className="play-dot" aria-hidden="true">▶</span> Veja como funciona</a>
          </div>
          <div className="hero-trust">
            <span><b>{OCCUPATIONS.length}+</b> cargos sugeridos</span>
            <i />
            <span>até <b>6</b> dimensões avaliadas</span>
            <i />
            <span>Resultado <b>explicável</b></span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Exemplo de resultado de compatibilidade">
          <div className="preview-window">
            <div className="preview-topbar">
              <div className="mini-brand"><span className="mini-mark">N</span> NexoCV</div>
              <div className="window-dots"><span /><span /><span /></div>
            </div>
            <div className="preview-role">
              <div className="company-token">A</div>
              <div><strong>Analista de Dados</strong><small>Empresa Aurora • São Paulo</small></div>
              <span className="status-pill">Análise concluída</span>
            </div>
            <div className="preview-score-row">
              <div className="score-ring score-ring-demo"><span><b>87</b><small>/100</small></span></div>
              <div className="preview-score-copy"><span>Ótima compatibilidade</span><strong>Seu currículo se destaca.</strong><p>Você atende aos principais critérios da vaga.</p></div>
            </div>
            <div className="preview-bars">
              <PreviewBar label="Competências" value={92} />
              <PreviewBar label="Experiência" value={84} />
              <PreviewBar label="Empresa e vaga" value={78} />
            </div>
            <div className="preview-tags"><span>SQL</span><span>Power BI</span><span>Excel</span><span>+5</span></div>
          </div>
          <div className="floating-card floating-card-top"><span className="floating-icon">✓</span><div><small>Leitura concluída</small><strong>Currículo processado</strong></div></div>
          <div className="floating-card floating-card-bottom"><span className="spark">✦</span><div><small>Próximo ajuste</small><strong>Inclua resultados em %</strong></div></div>
        </div>
      </section>

      <section className="analysis-section" id="analisar">
        <div className="section-heading centered">
          <span className="section-kicker">Faça sua análise</span>
          <h2>Uma comparação que você consegue entender.</h2>
          <p>Nada de nota solta: cada ponto vem acompanhado do motivo e de um próximo passo.</p>
        </div>

        <div className="analysis-shell">
          <div className="analysis-steps" aria-label="Etapas da análise">
            <span className="active"><b>1</b> Contexto</span><i />
            <span className={resumeText ? "active" : ""}><b>2</b> Currículo</span><i />
            <span className={result ? "active" : ""}><b>3</b> Resultado</span>
          </div>

          <div className="analysis-grid">
            <div className="form-panel">
              <div className="form-title"><span className="title-number">01</span><div><h3>Em qual empresa fica essa oportunidade?</h3><p>O setor e as prioridades entram de verdade na compatibilidade.</p></div></div>
              <div className="field-grid">
                <label className="field">
                  <span>Nome da empresa <b>*</b></span>
                  <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Nubank, Ambev, Aurora..." maxLength={120} />
                </label>
                <label className="field">
                  <span>Setor da empresa <b>*</b></span>
                  <select value={companySectorId} onChange={(event) => setCompanySectorId(event.target.value)}>
                    <option value="">Selecione o setor</option>
                    {COMPANY_SECTORS.map((sector) => <option key={sector.id} value={sector.id}>{sector.label}</option>)}
                  </select>
                </label>
              </div>

              <fieldset className="priority-fieldset">
                <legend>O que essa empresa mais valoriza? <small>opcional • escolha até 4</small></legend>
                <div className="priority-chips">
                  {COMPANY_PRIORITIES.map((priority) => {
                    const selected = companyPriorityIds.includes(priority.id);
                    const disabled = !selected && companyPriorityIds.length >= 4;
                    return (
                      <button
                        type="button"
                        key={priority.id}
                        className={selected ? "selected" : ""}
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={() => setCompanyPriorityIds((current) => selected
                          ? current.filter((id) => id !== priority.id)
                          : [...current, priority.id])}
                      >
                        <span aria-hidden="true">{selected 