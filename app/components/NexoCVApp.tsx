"use client";

import type { CSSProperties, DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  analyzeCompatibility,
  getRoleProfile,
  ROLE_PROFILES,
  type MatchResult,
} from "../../lib/matcher";

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
  const [roleId, setRoleId] = useState("data");
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
  const [resultContext, setResultContext] = useState({ company: "", roleLabel: "" });
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
      setFormError("Informe a empresa para deixar a análise contextualizada.");
      return;
    }
    if (resumeText.trim().length < 120) {
      setFormError("Envie o currículo ou cole pelo menos um trecho completo para analisar.");
      setManualOpen(true);
      return;
    }

    setIsAnalyzing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 520));

    const nextResult = analyzeCompatibility({
      resumeText,
      roleId,
      company: company.trim(),
      jobDescription,
    });
    const role = getRoleProfile(roleId);
    setResult(nextResult);
    setResultContext({ company: company.trim(), roleLabel: role.title });
    setIsAnalyzing(false);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    if (user) {
      await saveAnalysis(nextResult, role.title);
    } else {
      setSaveNotice("Resultado pronto. Entre com o ChatGPT para manter esta análise no seu histórico privado.");
    }
  }

  async function saveAnalysis(nextResult: MatchResult, roleLabel: string) {
    const form = new FormData();
    form.set("company", company.trim());
    form.set("roleId", roleId);
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
    setResultContext({ company: item.company, roleLabel: item.roleLabel });
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function resetAnalysis() {
    setCompany("");
    setRoleId("data");
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
      result.level,
      "Compare seu currículo antes de se candidatar.",
    ].join("\n");
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
            <span><b>12</b> perfis profissionais</span>
            <i />
            <span><b>5</b> dimensões avaliadas</span>
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
              <PreviewBar label="Palavras-chave" value={78} />
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
            <span className="active"><b>1</b> Vaga</span><i />
            <span className={resumeText ? "active" : ""}><b>2</b> Currículo</span><i />
            <span className={result ? "active" : ""}><b>3</b> Resultado</span>
          </div>

          <div className="analysis-grid">
            <div className="form-panel">
              <div className="form-title"><span className="title-number">01</span><div><h3>Qual oportunidade você quer comparar?</h3><p>Selecione a profissão e informe a empresa.</p></div></div>
              <div className="field-grid">
                <label className="field">
                  <span>Empresa <b>*</b></span>
                  <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Ex.: Nubank, Ambev, Aurora..." maxLength={120} />
                </label>
                <label className="field">
                  <span>Profissão / cargo <b>*</b></span>
                  <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
                    {ROLE_PROFILES.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}
                  </select>
                </label>
              </div>
              <label className="field full-field">
                <span>Descrição da vaga <small>opcional, mas melhora a precisão</small></span>
                <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Cole aqui os requisitos e responsabilidades do anúncio..." rows={5} maxLength={8000} />
                <small className="field-counter">{jobDescription.length.toLocaleString("pt-BR")} / 8.000</small>
              </label>

              <div className="form-divider" />
              <div className="form-title"><span className="title-number">02</span><div><h3>Agora, envie seu currículo</h3><p>O arquivo é lido com segurança para fazer a comparação.</p></div></div>

              <label
                className={`dropzone ${isDragging ? "dragging" : ""} ${resumeFile ? "has-file" : ""}`}
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
                onDrop={(event: DragEvent<HTMLLabelElement>) => {
                  event.preventDefault();
                  setIsDragging(false);
                  const file = event.dataTransfer.files[0];
                  if (file) void selectFile(file);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void selectFile(file);
                  }}
                />
                {isReading ? (
                  <><span className="upload-spinner" /><strong>Lendo seu currículo...</strong><small>Isso leva só alguns segundos</small></>
                ) : resumeFile ? (
                  <><span className="file-success">✓</span><strong>{resumeFile.name}</strong><small>{formatBytes(resumeFile.size)} • pronto para analisar</small><button type="button" className="replace-file" onClick={(event) => { event.preventDefault(); fileInputRef.current?.click(); }}>Trocar arquivo</button></>
                ) : (
                  <><span className="upload-icon" aria-hidden="true">↑</span><strong>Arraste o currículo aqui</strong><small>ou clique para selecionar • PDF, DOCX ou TXT • até 10 MB</small></>
                )}
              </label>

              <button type="button" className="paste-toggle" onClick={() => setManualOpen((current) => !current)} aria-expanded={manualOpen}>
                <span aria-hidden="true">▤</span> Prefere colar o texto do currículo? <b>{manualOpen ? "−" : "+"}</b>
              </button>
              {manualOpen && (
                <label className="field full-field paste-field">
                  <span>Conteúdo do currículo</span>
                  <textarea value={resumeText} onChange={(event) => { setResumeText(event.target.value); if (resumeFile) setResumeFile(null); }} placeholder="Cole aqui as experiências, formação e competências..." rows={8} maxLength={30000} />
                  <small className="field-counter">{resumeText.length.toLocaleString("pt-BR")} / 30.000</small>
                </label>
              )}

              {formError && <div className="form-error" role="alert"><span>!</span>{formError}</div>}

              <button className="analyze-button" type="button" onClick={() => void handleAnalyze()} disabled={isAnalyzing || isReading}>
                {isAnalyzing ? <><span className="button-spinner" /> Comparando currículo e vaga...</> : <>Ver minha compatibilidade <span aria-hidden="true">→</span></>}
              </button>
              <p className="form-privacy"><span aria-hidden="true">⌾</span> Sua análise é privada. O resultado é orientativo e não substitui a avaliação humana.</p>
            </div>

            <aside className="criteria-panel">
              <span className="criteria-label">O que entra na nota</span>
              <h3>Critérios objetivos, peso transparente.</h3>
              <p>O NexoCV procura evidências no currículo e compara com o perfil da função e o texto da vaga.</p>
              <div className="criteria-list">
                <Criterion icon="⌘" title="Competências técnicas" weight="45%" text="Ferramentas, métodos e conhecimentos essenciais." />
                <Criterion icon="↗" title="Experiência" weight="22%" text="Tempo e contexto profissional demonstrados." />
                <Criterion icon="◎" title="Aderência à vaga" weight="15%" text="Termos e responsabilidades do anúncio." />
                <Criterion icon="◇" title="Comportamental" weight="10%" text="Sinais de colaboração, comunicação e organização." />
                <Criterion icon="□" title="Formação" weight="8%" text="Formação acadêmica e técnica identificada." />
              </div>
              <div className="criteria-tip"><span>✦</span><p><strong>Dica para uma análise melhor</strong>Cole a descrição completa da vaga e mantenha resultados mensuráveis no currículo.</p></div>
            </aside>
          </div>
        </div>
      </section>

      {result && (
        <section className="results-section" ref={resultRef} aria-live="polite">
          <div className="result-header">
            <div><span className="section-kicker">Seu diagnóstico</span><h2>{resultContext.roleLabel}</h2><p>{resultContext.company}</p></div>
            <button type="button" className="ghost-button" onClick={resetAnalysis}>Nova análise</button>
          </div>

          <div className="result-overview">
            <div className="result-score-card">
              <div className="score-ring result-ring" style={{ "--score": `${result.score * 3.6}deg` } as CSSProperties}><span><b>{result.score}</b><small>/100</small></span></div>
              <div className="result-score-copy"><span className="result-level">{result.level}</span><h3>{result.score >= 70 ? "Seu currículo está no caminho certo." : "Há espaço claro para ganhar aderência."}</h3><p>{result.summary}</p></div>
            </div>
            <div className="result-actions">
              <button type="button" className="whatsapp-button" onClick={shareOnWhatsApp}><span aria-hidden="true">◉</span> Compartilhar no WhatsApp</button>
              {saveNotice && <p>{saveNotice}</p>}
            </div>
          </div>

          <div className="result-grid">
            <article className="result-card dimensions-card">
              <div className="card-heading"><span className="card-icon indigo">≡</span><div><h3>Composição da nota</h3><p>Veja onde o currículo ganha ou perde pontos.</p></div></div>
              <div className="dimension-list">
                {result.dimensions.map((dimension) => (
                  <div className="dimension" key={dimension.id}>
                    <div className="dimension-top"><span>{dimension.label}</span><b>{dimension.score}%</b></div>
                    <div className="progress-track"><span style={{ width: `${dimension.score}%` }} /></div>
                    <small>{dimension.detail}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-card skills-card">
              <div className="card-heading"><span className="card-icon green">✓</span><div><h3>Competências encontradas</h3><p>O que já aparece a seu favor.</p></div></div>
              <div className="tag-cloud positive">
                {result.matchedSkills.length ? result.matchedSkills.map((item) => <span key={item}>✓ {item}</span>) : <p className="empty-copy">As competências podem estar no currículo, mas não apareceram com os termos esperados.</p>}
              </div>
              <div className="card-subsection"><h4>Lacunas mais relevantes</h4><div className="tag-cloud warning">{result.missingSkills.slice(0, 6).map((item) => <span key={item}>+ {item}</span>)}</div></div>
            </article>

            <article className="result-card strengths-card">
              <div className="card-heading"><span className="card-icon blue">↗</span><div><h3>Leitura do currículo</h3><p>Pontos fortes e sinais que faltaram.</p></div></div>
              <div className="insight-columns">
                <div><h4><span className="positive-dot" /> Pontos fortes</h4><ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h4><span className="warning-dot" /> O que merece atenção</h4><ul>{result.gaps.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
            </article>

            <article className="result-card recommendations-card">
              <div className="card-heading"><span className="card-icon amber">✦</span><div><h3>Próximos ajustes</h3><p>Ações práticas antes de se candidatar.</p></div></div>
              <ol className="recommendation-list">{result.recommendations.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}</ol>
            </article>
          </div>
          <p className="result-disclaimer">A nota mostra aderência textual e evidências profissionais. Ela não prevê contratação, desempenho ou potencial e nunca deve ser usada como decisão automática.</p>
        </section>
      )}

      <section className="how-section" id="como-funciona">
        <div className="section-heading"><span className="section-kicker">Do arquivo ao plano de ação</span><h2>Três passos. Nenhuma caixa-preta.</h2><p>Você entende o resultado e sai sabendo exatamente o que fazer.</p></div>
        <div className="how-grid">
          <HowCard number="01" symbol="↥" title="Envie o currículo" text="PDF, Word ou texto. A leitura acontece sem você precisar reorganizar o documento." />
          <HowCard number="02" symbol="⌕" title="Escolha a oportunidade" text="Informe empresa, profissão e, se tiver, cole o anúncio completo da vaga." />
          <HowCard number="03" symbol="↗" title="Receba o diagnóstico" text="Veja nota, critérios, competências, lacunas e recomendações práticas." />
        </div>
      </section>

      <section className="history-section" id="historico">
        <div className="history-copy"><span className="section-kicker">Seu progresso em um só lugar</span><h2>Compare oportunidades sem perder o histórico.</h2><p>Quando sua conta está conectada, cada análise fica salva para você voltar, comparar notas e acompanhar a evolução do currículo.</p>
          {!user && <a className="primary-button dark" href={signInPath}>Entrar e salvar análises <span>→</span></a>}
        </div>
        <div className="history-panel">
          <div className="history-panel-header"><div><h3>Análises recentes</h3><p>{user ? user.email : "Histórico privado da sua conta"}</p></div><span className="history-count">{history.length}</span></div>
          {historyLoading ? <div className="history-loading"><span /><span /><span /></div> : history.length ? (
            <div className="history-list">
              {history.slice(0, 5).map((item) => (
                <button key={item.id} type="button" className="history-item" onClick={() => openHistoryItem(item)} disabled={!item.result}>
                  <span className={`history-score ${scoreClass(item.score)}`}>{item.score}</span>
                  <span className="history-info"><strong>{item.roleLabel}</strong><small>{item.company} • {formatDate(item.createdAt)}</small></span>
                  <span className="history-arrow">→</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="history-empty"><span>⌁</span><strong>{user ? "Seu primeiro resultado aparecerá aqui" : "Entre para ativar seu histórico"}</strong><p>Analise uma vaga e volte quando quiser.</p></div>
          )}
        </div>
      </section>

      <section className="security-section" id="seguranca">
        <div className="security-badge" aria-hidden="true"><span>⌾</span></div>
        <div><span className="section-kicker light">Privacidade desde o começo</span><h2>Currículo é pessoal. Tratamos como tal.</h2><p>O arquivo é usado para gerar sua análise e fica associado somente à sua conta. Não vendemos currículos nem usamos a nota como decisão automática de contratação.</p></div>
        <div className="security-points"><span>✓ Histórico privado</span><span>✓ Arquivos protegidos</span><span>✓ Resultado explicável</span></div>
      </section>

      <section className="final-cta">
        <span className="section-kicker">Antes do próximo “candidatar-se”</span>
        <h2>Descubra o que o recrutador precisa enxergar.</h2>
        <p>Compare agora e transforme seu currículo em uma candidatura mais objetiva.</p>
        <a className="primary-button" href="#analisar">Analisar meu currículo <span>→</span></a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">N</span><span>NexoCV</span></a>
        <p>Compatibilidade com clareza. Decisões com contexto.</p>
        <nav aria-label="Links do rodapé"><a href="#como-funciona">Como funciona</a><a href="#seguranca">Privacidade</a><a href="#analisar">Nova análise</a></nav>
        <small>© {new Date().getFullYear()} NexoCV. Análise orientativa.</small>
      </footer>
    </main>
  );
}

function PreviewBar({ label, value }: { label: string; value: number }) {
  return <div><span>{label}<b>{value}%</b></span><i><em style={{ width: `${value}%` }} /></i></div>;
}

function Criterion({ icon, title, weight, text }: { icon: string; title: string; weight: string; text: string }) {
  return <div className="criterion"><span className="criterion-icon">{icon}</span><p><strong>{title}</strong><small>{text}</small></p><b>{weight}</b></div>;
}

function HowCard({ number, symbol, title, text }: { number: string; symbol: string; title: string; text: string }) {
  return <article className="how-card"><span className="how-number">{number}</span><span className="how-symbol">{symbol}</span><h3>{title}</h3><p>{text}</p></article>;
}

async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "txt" || extension === "md" || file.type.startsWith("text/")) return file.text();
  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }
  if (extension === "pdf" || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
    return pages.join("\n");
  }
  throw new Error("Formato não reconhecido.");
}

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function firstName(value: string): string {
  const normalized = value.includes("@") ? value.split("@")[0] : value;
  return normalized.trim().split(/\s+/)[0] || "Você";
}

function formatDate(value: string): string {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(".", "");
}

function scoreClass(score: number): string {
  if (score >= 80) return "high";
  if (score >= 55) return "medium";
  return "low";
}

