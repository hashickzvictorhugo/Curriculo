"use client";

import type { CSSProperties, DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  analyzeCompatibility,
  type MatchResult,
} from "../../lib/matcher";
import {
  createRoleId,
} from "../../lib/role-catalog";
import {
  findConfiguredOccupation,
  type SiteConfig,
} from "../../lib/site-config";
import { AdminPanel } from "./AdminPanel";

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
  initialConfig: SiteConfig;
  configRevision: number;
  isAdmin: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function NexoCVApp({
  user,
  signInPath,
  signOutPath,
  initialConfig,
  configRevision,
  isAdmin,
}: NexoCVAppProps) {
  const [siteConfig, setSiteConfig] = useState(initialConfig);
  const [currentConfigRevision, setCurrentConfigRevision] = useState(configRevision);
  const [company, setCompany] = useState("");
  const [companySectorId, setCompanySectorId] = useState("");
  const [companyPriorityIds, setCompanyPriorityIds] = useState<string[]>([]);
  const [companyDescription, setCompanyDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState(() => defaultRoleTitle(initialConfig));
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
  const [adminLauncherVisible, setAdminLauncherVisible] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const adminSequenceRef = useRef(0);
  const adminSequenceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/analyses")
      .then(async (response) => {
        if (!response.ok) throw new Error("HistÃ³rico indisponÃ­vel");
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

  useEffect(() => () => {
    if (adminSequenceTimerRef.current) window.clearTimeout(adminSequenceTimerRef.current);
  }, []);

  async function selectFile(file: File) {
    setFormError("");
    setSaveNotice("");
    if (file.size > MAX_FILE_SIZE) {
      setFormError("O currÃ­culo precisa ter no mÃ¡ximo 10 MB.");
      return;
    }
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) {
      setFormError("Envie seu currÃ­culo em PDF, Word (.docx) ou TXT.");
      return;
    }

    setIsReading(true);
    try {
      const extracted = await extractResumeText(file);
      if (extracted.trim().length < 80) {
        throw new Error("NÃ£o foi possÃ­vel encontrar texto suficiente nesse arquivo.");
      }
      setResumeFile(file);
      setResumeText(extracted.trim());
      setManualOpen(false);
    } catch (error) {
      setResumeFile(null);
      setManualOpen(true);
      setFormError(
        error instanceof Error
          ? `${error.message} VocÃª pode colar o conteÃºdo do currÃ­culo abaixo.`
          : "NÃ£o foi possÃ­vel ler o arquivo. Cole o conteÃºdo do currÃ­culo abaixo.",
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
      setFormError("Selecione o setor da empresa para ele participar da anÃ¡lise.");
      return;
    }
    if (!roleTitle.trim()) {
      setFormError("Informe a profissÃ£o ou o cargo da vaga.");
      return;
    }
    const occupation = findConfiguredOccupation(siteConfig, roleTitle);
    if (!occupation && jobDescription.trim().length < 80) {
      setFormError("Esse cargo Ã© personalizado. Cole ao menos um trecho da descriÃ§Ã£o da vaga para a comparaÃ§Ã£o ficar correta.");
      return;
    }
    if (companySectorId === "other" && !companyPriorityIds.length && companyDescription.trim().length < 80) {
      setFormError("Para uma empresa multissetorial, selecione uma prioridade ou cole um trecho sobre a empresa.");
      return;
    }
    if (resumeText.trim().length < 120) {
      setFormError("Envie o currÃ­culo ou cole pelo menos um trecho completo para analisar.");
      setManualOpen(true);
      return;
    }

    setIsAnalyzing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 520));

    const resolvedRoleId = occupation?.id ?? createRoleId(roleTitle);
    const resolvedRoleLabel = occupation?.title ?? roleTitle.trim();
    const selectedSector = siteConfig.sectors.find((sector) => sector.id === companySectorId);
    const selectedPriorities = siteConfig.priorities.filter((priority) => companyPriorityIds.includes(priority.id));
    const nextResult = analyzeCompatibility({
      resumeText,
      roleId: resolvedRoleId,
      roleTitle: resolvedRoleLabel,
      roleProfileId: occupation?.profileId,
      roleSkillKeywords: occupation?.skillKeywords,
      company: company.trim(),
      companySectorId,
      companyPriorityIds,
      companySector: selectedSector ?? null,
      companyPriorities: selectedPriorities,
      companyDescription,
      jobDescription,
      weights: siteConfig.weights,
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
      setSaveNotice("Resultado pronto. Entre com o ChatGPT para manter esta anÃ¡lise no seu histÃ³rico privado.");
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
      if (!response.ok || !payload.analysis) throw new Error(payload.error || "NÃ£o foi possÃ­vel salvar agora.");
      setHistory((current) => [payload.analysis as HistoryItem, ...current].slice(0, 20));
      setSaveNotice("AnÃ¡lise salva no seu histÃ³rico privado.");
    } catch {
      setSaveNotice("A anÃ¡lise estÃ¡ pronta, mas o histÃ³rico nÃ£o pÃ´de ser atualizado agora.");
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
    setRoleTitle(defaultRoleTitle(siteConfig));
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
      `Minha anÃ¡lise no NexoCV: ${result.score}% de compatibilidade`,
      `${resultContext.roleLabel} â€¢ ${resultContext.company}`,
      resultContext.sectorLabel ? `Contexto: ${resultContext.sectorLabel}` : "",
      result.level,
      "Compare seu currÃ­culo antes de se candidatar.",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function handleAdminSequence(token: "000" | "2") {
    if (!isAdmin) return;
    const sequence: Array<"000" | "2"> = ["000", "000", "000", "2", "2"];
    const currentIndex = adminSequenceRef.current;
    const nextIndex = token === sequence[currentIndex]
      ? currentIndex + 1
      : token === "000" ? 1 : 0;
    adminSequenceRef.current = nextIndex;
    if (adminSequenceTimerRef.current) window.clearTimeout(adminSequenceTimerRef.current);
    adminSequenceTimerRef.current = window.setTimeout(() => {
      adminSequenceRef.current = 0;
    }, 8000);
    if (nextIndex === sequence.length) {
      adminSequenceRef.current = 0;
      setAdminLauncherVisible(true);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="NexoCV, inÃ­cio">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NexoCV</span>
        </a>
        <nav className="main-nav" aria-label="NavegaÃ§Ã£o principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#seguranca">SeguranÃ§a</a>
          <a href="#historico">HistÃ³rico</a>
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
          <span className="eyebrow"><span className="eyebrow-dot" /> {siteConfig.content.heroEyebrow}</span>
          <h1>{siteConfig.content.heroTitleLead} <em>{siteConfig.content.heroTitleAccent}</em></h1>
          <p>{siteConfig.content.heroDescription}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#analisar">{siteConfig.content.heroPrimaryCta} <span aria-hidden="true">â†’</span></a>
            <a className="secondary-link" href="#como-funciona"><span className="play-dot" aria-hidden="true">â–¶</span> {siteConfig.content.heroSecondaryCta}</a>
          </div>
          <div className="hero-trust">
            <span><b>{siteConfig.occupations.length}+</b> {siteConfig.content.heroTrustRoles}</span>
            <i />
            <span>{siteConfig.content.heroTrustDimensions}</span>
            <i />
            <span>{siteConfig.content.heroTrustExplainable}</span>
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
              <div><strong>Analista de Dados</strong><small>Empresa Aurora â€¢ SÃ£o Paulo</small></div>
              <span className="status-pill">AnÃ¡lise concluÃ­da</span>
            </div>
            <div className="preview-score-row">
              <div className="score-ring score-ring-demo"><span><b>87</b><small>/100</small></span></div>
              <div className="preview-score-copy"><span>Ã“tima compatibilidade</span><strong>Seu currÃ­culo se destaca.</strong><p>VocÃª atende aos principais critÃ©rios da vaga.</p></div>
            </div>
            <div className="preview-bars">
              <PreviewBar label="CompetÃªncias" value={92} />
              <PreviewBar label="ExperiÃªncia" value={84} />
              <PreviewBar label="Empresa e vaga" value={78} />
            </div>
            <div className="preview-tags"><span>SQL</span><span>Power BI</span><span>Excel</span><span>+5</span></div>
          </div>
          <div className="floating-card floating-card-top"><span className="floating-icon">âœ“</span><div><small>Leitura concluÃ­da</small><strong>CurrÃ­culo processado</strong></div></div>
          <div className="floating-card floating-card-bottom"><span className="spark">âœ¦</span><div><small>PrÃ³ximo ajuste</small><strong>Inclua resultados em %</strong></div></div>
        </div>
      </section>

      <section className="analysis-section" id="analisar">
        <div className="section-heading centered">
          <span className="section-kicker">{siteConfig.content.analysisKicker}</span>
          <h2>{siteConfig.content.analysisTitle}</h2>
          <p>{siteConfig.content.analysisDescription}</p>
        </div>

        <div className="analysis-shell">
          <div className="analysis-steps" aria-label="Etapas da anÃ¡lise">
            <span className="active"><b>1</b> Contexto</span><i />
            <span className={resumeText ? "active" : ""}><b>2</b> CurrÃ­culo</span><i />
            <span className={result ? "active" : ""}><b>3</b> Resultado</span>
          </div>

          <div className="analysis-grid">
            <div className="form-panel">
              <div className="form-title"><span className="title-number">01</span><div><h3>{siteConfig.content.companyStepTitle}</h3><p>{siteConfig.content.companyStepDescription}</p></div></div>
              <div className="field-grid">
                <label className="field">
                  ÛÎù¶‰ËkºwµçyÑ…°ˆİ•¥¡Ğõí€‘íÍ¥Ñ•½¹™¥œ¹İ•¥¡ÑÌ¹Í½™ÑM­¥±±Íô•ôÑ•áĞô‰M¥¹…¥Ì‘”½±…‰½É‡Ÿ¼°½µÕ¹¥‡Ÿ¼”½É…¹¥é‡Ÿ¼¸ˆ€¼ø(€€€€€€€€€€€€€€€€ñÉ¥Ñ•É¥½¸¥½¸ô‹ŠZ„ˆÑ¥Ñ±”ô‰½Éµ‡Ÿ¼ˆİ•¥¡Ğõí€‘íÍ¥Ñ•½¹™¥œ¹İ•¥¡ÑÌ¹•‘Õ…Ñ¥½¹ô•ôÑ•áĞô‰½Éµ‡Ÿ¼……“©µ¥„”Ó¥¹¥„¥‘•¹Ñ¥™¥…‘„¸ˆ€¼ø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥Ñ•É¥„µÑ¥ÀˆøñÍÁ…¸ûŠr˜ğ½ÍÁ…¸øñÀøñÍÑÉ½¹œùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹É¥Ñ•É¥…Q¥ÁQ¥Ñ±•ôğ½ÍÑÉ½¹œùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹É¥Ñ•É¥…Q¥Á•ÍÉ¥ÁÑ¥½¹ôğ½Àøğ½‘¥Øø(€€€€€€€€€€€€ğ½…Í¥‘”ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€íÉ•ÍÕ±Ğ€˜˜€ (€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰É•ÍÕ±ÑÌµÍ•Ñ¥½¸ˆÉ•˜õíÉ•ÍÕ±ÑI•™ô…É¥„µ±¥Ù”ô‰Á½±¥Ñ”ˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ¡•…‘•Èˆø(€€€€€€€€€€€€ñ‘¥ØøñÍÁ…¸±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µ­¥­•ÈˆùM•Ô‘¥…»ÍÍÑ¥¼ğ½ÍÁ…¸øñ ÈùíÉ•ÍÕ±Ñ½¹Ñ•áĞ¹É½±•1…‰•±ôğ½ ÈøñÀùíÉ•ÍÕ±Ñ½¹Ñ•áĞ¹½µÁ…¹åõíÉ•ÍÕ±Ñ½¹Ñ•áĞ¹Í•Ñ½É1…‰•°€ü€ƒŠˆ€‘íÉ•ÍÕ±Ñ½¹Ñ•áĞ¹Í•Ñ½É1…‰•±õ€€è€ˆ‰ôğ½Àøğ½‘¥Øø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰¡½ÍĞµ‰ÕÑÑ½¸ˆ½¹±¥¬õíÉ•Í•Ñ¹…±åÍ¥Íôù9½Ù„…»…±¥Í”ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ½Ù•ÉÙ¥•Üˆø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•ÍÕ±ĞµÍ½É”µ…Éˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í½É”µÉ¥¹œÉ•ÍÕ±ĞµÉ¥¹œˆÍÑå±”õíì€ˆ´µÍ½É”ˆè€‘íÉ•ÍÕ±Ğ¹Í½É”€¨€Ì¸Ùõ‘•€ô…ÌMMAÉ½Á•ÉÑ¥•ÍôøñÍÁ…¸øñˆùíÉ•ÍÕ±Ğ¹Í½É•ôğ½ˆøñÍµ…±°ø¼ÄÀÀğ½Íµ…±°øğ½ÍÁ…¸øğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•ÍÕ±ĞµÍ½É”µ½ÁäˆøñÍÁ…¸±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ±•Ù•°ˆùíÉ•ÍÕ±Ğ¹±•Ù•±ôğ½ÍÁ…¸øñ ÌùíÉ•ÍÕ±Ğ¹Í½É”€øô€ÜÀ€ü€‰M•ÔÕÉËµÕ±¼•ÍÓ„¹¼…µ¥¹¡¼•ÉÑ¼¸ˆ€è€‰#„•ÍÁ‡¼±…É¼Á…É„…¹¡…È…‘•Ë©¹¥„¸‰ôğ½ ÌøñÀùíÉ•ÍÕ±Ğ¹ÍÕµµ…Éåôğ½Àøğ½‘¥Øø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ…Ñ¥½¹Ìˆø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰İ¡…ÑÍ…ÁÀµ‰ÕÑÑ½¸ˆ½¹±¥¬õíÍ¡…É•=¹]¡…ÑÍÁÁôøñÍÁ…¸…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆûŠ^$ğ½ÍÁ…¸ø½µÁ…ÉÑ¥±¡…È¹¼]¡…ÑÍÁÀğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€íÍ…Ù•9½Ñ¥”€˜˜€ñÀùíÍ…Ù•9½Ñ¥•ôğ½Àùô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É•ÍÕ±ĞµÉ¥ˆø(€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ…É‘¥µ•¹Í¥½¹Ìµ…Éˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…Éµ¡•…‘¥¹œˆøñÍÁ…¸±…ÍÍ9…µ”ô‰…Éµ¥½¸¥¹‘¥¼ˆûŠ&„ğ½ÍÁ…¸øñ‘¥Øøñ Ìù½µÁ½Í§Ÿ¼‘„¹½Ñ„ğ½ ÌøñÀùY•©„½¹‘”¼ÕÉËµÕ±¼…¹¡„½ÔÁ•É‘”Á½¹Ñ½Ì¸ğ½Àøğ½‘¥Øøğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘¥µ•¹Í¥½¸µ±¥ÍĞˆø(€€€€€€€€€€€€€€€íÉ•ÍÕ±Ğ¹‘¥µ•¹Í¥½¹Ì¹µ…À ¡‘¥µ•¹Í¥½¸¤€ôø€ (€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘¥µ•¹Í¥½¸ˆ­•äõí‘¥µ•¹Í¥½¸¹¥‘ôø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘¥µ•¹Í¥½¸µÑ½ÀˆøñÍÁ…¸ùí‘¥µ•¹Í¥½¸¹±…‰•±õíÑåÁ•½˜‘¥µ•¹Í¥½¸¹İ•¥¡Ğ€ôôô€‰¹Õµ‰•Èˆ€˜˜€ñÍµ…±°ùí‘¥µ•¹Í¥½¸¹İ•¥¡Ñô”‘„¹½Ñ„¹•ÍÑ„…»…±¥Í”ğ½Íµ…±°ùôğ½ÍÁ…¸øñˆùí‘¥µ•¹Í¥½¸¹Í½É•ô”ğ½ˆøğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰ÁÉ½É•ÍÌµÑÉ…¬ˆøñÍÁ…¸ÍÑå±”õíìİ¥‘Ñ è€‘í‘¥µ•¹Í¥½¸¹Í½É•ô•€õô€¼øğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñÍµ…±°ùí‘¥µ•¹Í¥½¸¹‘•Ñ…¥±ôğ½Íµ…±°ø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½…ÉÑ¥±”ø((€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ…É½µÁ…¹äµµ…Ñ µ…Éˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…Éµ¡•…‘¥¹œˆøñÍÁ…¸±…ÍÍ9…µ”ô‰…Éµ¥½¸½µÁ…¹äˆûŠ^¬ğ½ÍÁ…¸øñ‘¥Øøñ Ìù½¹•ã¼½´„•µÁÉ•Í„ğ½ ÌøñÀùM•Ñ½È”ÁÉ¥½É¥‘…‘•ÌÁÉ½™¥ÍÍ¥½¹…¥Ì°Í•´…‘¥Ù¥¹¡…ÈÕ±ÑÕÉ„¸ğ½Àøğ½‘¥Øøğ½‘¥Øø(€€€€€€€€€€€€€íÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ €ü€ (€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…¹äµÍ½É”µ±¥¹”ˆø(€€€€€€€€€€€€€€€€€€€€ñ‘¥ØøñÍÑÉ½¹œùíÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹Í½É•ô”ğ½ÍÑÉ½¹œøñÍÁ…¸ù‘”…‘•Ë©¹¥„…¼½¹Ñ•áÑ¼¥¹™½Éµ…‘¼ğ½ÍÁ…¸øğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰½µÁ…¹äµÍ•Ñ½ÈµÁ¥±°ˆùíÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹Í•Ñ½É1…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰½µÁ…¹äµµ…Ñ µ‘•Ñ…¥°ˆùíÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹‘•Ñ…¥±ôğ½Àø(€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…¹äµÍ¥¹…°µ‰±½¬ˆø(€€€€€€€€€€€€€€€€€€€€ñ ĞùÙ¥“©¹¥…Ì•¹½¹ÑÉ…‘…Ìğ½ Ğø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ…œµ±½ÕÁ½Í¥Ñ¥Ù”½µÁ…Ğˆø(€€€€€€€€€€€€€€€€€€€€€íÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹µ…Ñ¡•‘M¥¹…±Ì¹±•¹Ñ (€€€€€€€€€€€€€€€€€€€€€€€€üÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹µ…Ñ¡•‘M¥¹…±Ì¹µ…À ¡¥Ñ•´¤€ôø€ñÍÁ…¸­•äõí¥Ñ•µôûŠrLí¥Ñ•µôğ½ÍÁ…¸ø¤(€€€€€€€€€€€€€€€€€€€€€€€€è€ñÀ±…ÍÍ9…µ”ô‰•µÁÑäµ½Áäˆù<ÕÉËµÕ±¼…¥¹‘„»¼‘•¥á„•Ù¥‘•¹Ñ”•áÁ•É§©¹¥„±¥…‘„„•ÍÍ”½¹Ñ•áÑ¼¸ğ½Àùô(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€ì„…É•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹µ¥ÍÍ¥¹M¥¹…±Ì¹±•¹Ñ €˜˜€ (€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…¹äµÍ¥¹…°µ‰±½¬µ¥ÍÍ¥¹œˆø(€€€€€€€€€€€€€€€€€€€€€€ñ ĞùM¥¹…¥ÌÅÕ”Á½‘•´™¥…Èµ…¥Ì±…É½Ìğ½ Ğø(€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ…œµ±½Õİ…É¹¥¹œ½µÁ…ĞˆùíÉ•ÍÕ±Ğ¹½µÁ…¹å5…Ñ ¹µ¥ÍÍ¥¹M¥¹…±Ì¹Í±¥” À°€Ø¤¹µ…À ¡¥Ñ•´¤€ôø€ñÍÁ…¸­•äõí¥Ñ•µôø¬í¥Ñ•µôğ½ÍÁ…¸ø¥ôğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰•µÁÑäµ½Áä±•…äµ½µÁ…¹äµ½ÁäˆùÍÑ„…»…±¥Í”™½¤É¥…‘„…¹Ñ•Ì‘”¼½¹Ñ•áÑ¼‘„•µÁÉ•Í„•¹ÑÉ…È¹„¹½Ñ„¸‡„Õµ„¹½Ù„…»…±¥Í”Á…É„Ù•È•ÍÍ„‘¥µ•¹Ï¼¸ğ½Àø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€ğ½…ÉÑ¥±”ø((€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ…ÉÍ­¥±±Ìµ…Éˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…Éµ¡•…‘¥¹œˆøñÍÁ…¸±…ÍÍ9…µ”ô‰…Éµ¥½¸É••¸ˆûŠrLğ½ÍÁ…¸øñ‘¥Øøñ Ìù½µÁ•Ó©¹¥…Ì•¹½¹ÑÉ…‘…Ìğ½ ÌøñÀù<ÅÕ”«„…Á…É•”„Í•Ô™…Ù½È¸ğ½Àøğ½‘¥Øøğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ…œµ±½ÕÁ½Í¥Ñ¥Ù”ˆø(€€€€€€€€€€€€€€€íÉ•ÍÕ±Ğ¹µ…Ñ¡•‘M­¥±±Ì¹±•¹Ñ €üÉ•ÍÕ±Ğ¹µ…Ñ¡•‘M­¥±±Ì¹µ…À ¡¥Ñ•´¤€ôø€ñÍÁ…¸­•äõí¥Ñ•µôûŠrLí¥Ñ•µôğ½ÍÁ…¸ø¤€è€ñÀ±…ÍÍ9…µ”ô‰•µÁÑäµ½ÁäˆùÌ½µÁ•Ó©¹¥…ÌÁ½‘•´•ÍÑ…È¹¼ÕÉËµÕ±¼°µ…Ì»¼…Á…É••É…´½´½ÌÑ•Éµ½Ì•ÍÁ•É…‘½Ì¸ğ½Àùô(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…ÉµÍÕ‰Í•Ñ¥½¸ˆøñ Ğù1…Õ¹…Ìµ…¥ÌÉ•±•Ù…¹Ñ•Ìğ½ Ğøñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ…œµ±½Õİ…É¹¥¹œˆùíÉ•ÍÕ±Ğ¹µ¥ÍÍ¥¹M­¥±±Ì¹Í±¥” À°€Ø¤¹µ…À ¡¥Ñ•´¤€ôø€ñÍÁ…¸­•äõí¥Ñ•µôø¬í¥Ñ•µôğ½ÍÁ…¸ø¥ôğ½‘¥Øøğ½‘¥Øø(€€€€€€€€€€€€ğ½…ÉÑ¥±”ø((€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ…ÉÍÑÉ•¹Ñ¡Ìµ…Éˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…Éµ¡•…‘¥¹œˆøñÍÁ…¸±…ÍÍ9…µ”ô‰…Éµ¥½¸‰±Õ”ˆûŠ\ğ½ÍÁ…¸øñ‘¥Øøñ Ìù1•¥ÑÕÉ„‘¼ÕÉËµÕ±¼ğ½ ÌøñÀùA½¹Ñ½Ì™½ÉÑ•Ì”Í¥¹…¥ÌÅÕ”™…±Ñ…É…´¸ğ½Àøğ½‘¥Øøğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¥¹Í¥¡Ğµ½±Õµ¹Ìˆø(€€€€€€€€€€€€€€€€ñ‘¥Øøñ ĞøñÍÁ…¸±…ÍÍ9…µ”ô‰Á½Í¥Ñ¥Ù”µ‘½Ğˆ€¼øA½¹Ñ½Ì™½ÉÑ•Ìğ½ ĞøñÕ°ùíÉ•ÍÕ±Ğ¹ÍÑÉ•¹Ñ¡Ì¹µ…À ¡¥Ñ•´¤€ôø€ñ±¤­•äõí¥Ñ•µôùí¥Ñ•µôğ½±¤ø¥ôğ½Õ°øğ½‘¥Øø(€€€€€€€€€€€€€€€€ñ‘¥Øøñ ĞøñÍÁ…¸±…ÍÍ9…µ”ô‰İ…É¹¥¹œµ‘½Ğˆ€¼ø<ÅÕ”µ•É•”…Ñ•»Ÿ¼ğ½ ĞøñÕ°ùíÉ•ÍÕ±Ğ¹…ÁÌ¹µ…À ¡¥Ñ•´¤€ôø€ñ±¤­•äõí¥Ñ•µôùí¥Ñ•µôğ½±¤ø¥ôğ½Õ°øğ½‘¥Øø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½…ÉÑ¥±”ø((€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ…ÉÉ•½µµ•¹‘…Ñ¥½¹Ìµ…Éˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…Éµ¡•…‘¥¹œˆøñÍÁ…¸±…ÍÍ9…µ”ô‰…Éµ¥½¸…µ‰•ÈˆûŠr˜ğ½ÍÁ…¸øñ‘¥Øøñ ÌùAËÍá¥µ½Ì…©ÕÍÑ•Ìğ½ ÌøñÀùŸÕ•ÌÁË…Ñ¥…Ì…¹Ñ•Ì‘”Í”…¹‘¥‘…Ñ…È¸ğ½Àøğ½‘¥Øøğ½‘¥Øø(€€€€€€€€€€€€€€ñ½°±…ÍÍ9…µ”ô‰É•½µµ•¹‘…Ñ¥½¸µ±¥ÍĞˆùíÉ•ÍÕ±Ğ¹É•½µµ•¹‘…Ñ¥½¹Ì¹µ…À ¡¥Ñ•´°¥¹‘•à¤€ôø€ñ±¤­•äõí¥Ñ•µôøñÍÁ…¸ùí¥¹‘•à€¬€Åôğ½ÍÁ…¸øñÀùí¥Ñ•µôğ½Àøğ½±¤ø¥ôğ½½°ø(€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰É•ÍÕ±Ğµ‘¥Í±…¥µ•Èˆù¹½Ñ„µ½ÍÑÉ„…‘•Ë©¹¥„Ñ•áÑÕ…°”•Ù¥“©¹¥…ÌÁÉ½™¥ÍÍ¥½¹…¥Ì¸±„»¼ÁÉ•Û¨½¹ÑÉ…Ñ‡Ÿ¼°‘•Í•µÁ•¹¡¼½ÔÁ½Ñ•¹¥…°”¹Õ¹„‘•Ù”Í•ÈÕÍ…‘„½µ¼‘•¥Ï¼…ÕÑ½·…Ñ¥„¸ğ½Àø(€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€¥ô((€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰¡½ÜµÍ•Ñ¥½¸ˆ¥ô‰½µ¼µ™Õ¹¥½¹„ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µ¡•…‘¥¹œˆøñÍÁ…¸±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µ­¥­•ÈˆùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İ-¥­•Éôğ½ÍÁ…¸øñ ÈùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İQ¥Ñ±•ôğ½ ÈøñÀùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İ•ÍÉ¥ÁÑ¥½¹ôğ½Àøğ½‘¥Øø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡½ÜµÉ¥ˆø(€€€€€€€€€€ñ!½İ…É¹Õµ‰•ÈôˆÀÄˆÍåµ‰½°ô‹Š”ˆÑ¥Ñ±”õíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İMÑ•ÀÅQ¥Ñ±•ôÑ•áĞõíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İMÑ•ÀÅ•ÍÉ¥ÁÑ¥½¹ô€¼ø(€€€€€€€€€€ñ!½İ…É¹Õµ‰•ÈôˆÀÈˆÍåµ‰½°ô‹Š2TˆÑ¥Ñ±”õíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İMÑ•ÀÉQ¥Ñ±•ôÑ•áĞõíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İMÑ•ÀÉ•ÍÉ¥ÁÑ¥½¹ô€¼ø(€€€€€€€€€€ñ!½İ…É¹Õµ‰•ÈôˆÀÌˆÍåµ‰½°ô‹Š\ˆÑ¥Ñ±”õíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İMÑ•ÀÍQ¥Ñ±•ôÑ•áĞõíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡½İMÑ•ÀÍ•ÍÉ¥ÁÑ¥½¹ô€¼ø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰¡¥ÍÑ½ÉäµÍ•Ñ¥½¸ˆ¥ô‰¡¥ÍÑ½É¥¼ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ½ÁäˆøñÍÁ…¸±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µ­¥­•ÈˆùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡¥ÍÑ½Éå-¥­•Éôğ½ÍÁ…¸øñ ÈùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡¥ÍÑ½ÉåQ¥Ñ±•ôğ½ ÈøñÀùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹¡¥ÍÑ½Éå•ÍÉ¥ÁÑ¥½¹ôğ½Àø(€€€€€€€€€ì…ÕÍ•È€˜˜€ñ„±…ÍÍ9…µ”ô‰ÁÉ¥µ…Éäµ‰ÕÑÑ½¸‘…É¬ˆ¡É•˜õíÍ¥¹%¹A…Ñ¡ôù¹ÑÉ…È”Í…±Ù…È…»…±¥Í•Ì€ñÍÁ…¸ûŠHğ½ÍÁ…¸øğ½„ùô(€€€€€€€€ğ½‘¥Øø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥ÍÑ½ÉäµÁ…¹•°ˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥ÍÑ½ÉäµÁ…¹•°µ¡•…‘•Èˆøñ‘¥Øøñ Ìù»…±¥Í•ÌÉ••¹Ñ•Ìğ½ ÌøñÀùíÕÍ•È€üÕÍ•È¹•µ…¥°€è€‰!¥ÍÓÍÉ¥¼ÁÉ¥Ù…‘¼‘„ÍÕ„½¹Ñ„‰ôğ½Àøğ½‘¥ØøñÍÁ…¸±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ½Õ¹Ğˆùí¡¥ÍÑ½Éä¹±•¹Ñ¡ôğ½ÍÁ…¸øğ½‘¥Øø(€€€€€€€€€í¡¥ÍÑ½Éå1½…‘¥¹œ€ü€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ±½…‘¥¹œˆøñÍÁ…¸€¼øñÍÁ…¸€¼øñÍÁ…¸€¼øğ½‘¥Øø€è¡¥ÍÑ½Éä¹±•¹Ñ €ü€ (€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ±¥ÍĞˆø(€€€€€€€€€€€€€í¡¥ÍÑ½Éä¹Í±¥” À°€Ô¤¹µ…À ¡¥Ñ•´¤€ôø€ (€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸­•äõí¥Ñ•´¹¥‘ôÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ¥Ñ•´ˆ½¹±¥¬õì ¤€ôø½Á•¹!¥ÍÑ½Éå%Ñ•´¡¥Ñ•´¥ô‘¥Í…‰±•õì…¥Ñ•´¹É•ÍÕ±Ñôø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”õí¡¥ÍÑ½ÉäµÍ½É”€‘íÍ½É•±…ÍÌ¡¥Ñ•´¹Í½É”¥õôùí¥Ñ•´¹Í½É•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ¥¹™¼ˆøñÍÑÉ½¹œùí¥Ñ•´¹É½±•1…‰•±ôğ½ÍÑÉ½¹œøñÍµ…±°ùí¥Ñ•´¹½µÁ…¹åôƒŠˆí™½Éµ…Ñ…Ñ”¡¥Ñ•´¹É•…Ñ•‘Ğ¥ôğ½Íµ…±°øğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ…ÉÉ½ÜˆûŠHğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€¤€è€ (€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥ÍÑ½Éäµ•µÁÑäˆøñÍÁ…¸ûŠ2ğ½ÍÁ…¸øñÍÑÉ½¹œùíÕÍ•È€ü€‰M•ÔÁÉ¥µ•¥É¼É•ÍÕ±Ñ…‘¼…Á…É••Ë„…ÅÕ¤ˆ€è€‰¹ÑÉ”Á…É„…Ñ¥Ù…ÈÍ•Ô¡¥ÍÓÍÉ¥¼‰ôğ½ÍÑÉ½¹œøñÀù¹…±¥Í”Õµ„Ù…„”Ù½±Ñ”ÅÕ…¹‘¼ÅÕ¥Í•È¸ğ½Àøğ½‘¥Øø(€€€€€€€€€€¥ô(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰Í•ÕÉ¥ÑäµÍ•Ñ¥½¸ˆ¥ô‰Í•ÕÉ…¹„ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í•ÕÉ¥Ñäµ‰…‘”ˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆøñÍÁ…¸ûŠ2øğ½ÍÁ…¸øğ½‘¥Øø(€€€€€€€€ñ‘¥ØøñÍÁ…¸±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µ­¥­•È±¥¡ĞˆùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹Í•ÕÉ¥Ñå-¥­•Éôğ½ÍÁ…¸øñ ÈùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹Í•ÕÉ¥ÑåQ¥Ñ±•ôğ½ ÈøñÀùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹Í•ÕÉ¥Ñå•ÍÉ¥ÁÑ¥½¹ôğ½Àøğ½‘¥Øø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í•ÕÉ¥ÑäµÁ½¥¹ÑÌˆøñÍÁ…¸ûŠrLíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹Í•ÕÉ¥ÑåA½¥¹ĞÅôğ½ÍÁ…¸øñÍÁ…¸ûŠrLíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹Í•ÕÉ¥ÑåA½¥¹ĞÉôğ½ÍÁ…¸øñÍÁ…¸ûŠrLíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹Í•ÕÉ¥ÑåA½¥¹ĞÍôğ½ÍÁ…¸øğ½‘¥Øø(€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰™¥¹…°µÑ„ˆø(€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µ­¥­•ÈˆùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹™¥¹…±-¥­•Éôğ½ÍÁ…¸ø(€€€€€€€€ñ ÈùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹™¥¹…±Q¥Ñ±•ôğ½ Èø(€€€€€€€€ñÀùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹™¥¹…±•ÍÉ¥ÁÑ¥½¹ôğ½Àø(€€€€€€€€ñ„±…ÍÍ9…µ”ô‰ÁÉ¥µ…Éäµ‰ÕÑÑ½¸ˆ¡É•˜ôˆ…¹…±¥Í…ÈˆùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹™¥¹…±Ñ…1…‰•±ô€ñÍÁ…¸ûŠHğ½ÍÁ…¸øğ½„ø(€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€ñ™½½Ñ•Èø(€€€€€€€€ñ„±…ÍÍ9…µ”ô‰‰É…¹™½½Ñ•Èµ‰É…¹ˆ¡É•˜ôˆÑ½ÀˆøñÍÁ…¸±…ÍÍ9…µ”ô‰‰É…¹µµ…É¬ˆù8ğ½ÍÁ…¸øñÍÁ…¸ù9•á½Xğ½ÍÁ…¸øğ½„ø(€€€€€€€€ñÀùíÍ¥Ñ•½¹™¥œ¹½¹Ñ•¹Ğ¹™½½Ñ•ÉQ…±¥¹•ôğ½Àø(€€€€€€€€ñ¹…Ø…É¥„µ±…‰•°ô‰1¥¹­Ì‘¼É½‘…Ã¤ˆøñ„¡É•˜ôˆ½µ¼µ™Õ¹¥½¹„ˆù½µ¼™Õ¹¥½¹„ğ½„øñ„¡É•˜ôˆÍ•ÕÉ…¹„ˆùAÉ¥Ù…¥‘…‘”ğ½„øñ„¡É•˜ôˆ…¹…±¥Í…Èˆù9½Ù„…»…±¥Í”ğ½„øğ½¹…Øø(€€€€€€€€ñÍµ…±°ø(€€€€€€€€€ƒ
¤í¹•Ü…Ñ” ¤¹•ÑÕ±±e•…È ¥ô9•á½X¸»…±¥Í”½É¥•¹Ñ…Ñ¥Ù„¸(€€€€€€€€€í¥Í‘µ¥¸€˜˜€ñÍÁ…¸±…ÍÍ9…µ”ô‰…‘µ¥¸µÍ•É•Ğµ½‘”ˆ…É¥„µ±…‰•°ô‰Í‘¥¼…‘µ¥¹¥ÍÑÉ…Ñ¥Ù¼ˆøñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø¡…¹‘±•‘µ¥¹M•ÅÕ•¹” ˆÀÀÀˆ¥ôøÀÀÀğ½‰ÕÑÑ½¸øñ¤û
Üğ½¤øñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø¡…¹‘±•‘µ¥¹M•ÅÕ•¹” ˆÈˆ¥ôøÈğ½‰ÕÑÑ½¸øğ½ÍÁ…¸ùô(€€€€€€€€ğ½Íµ…±°ø(€€€€€€ğ½™½½Ñ•Èø((€€€€€í¥Í‘µ¥¸€˜˜…‘µ¥¹1…Õ¹¡•ÉY¥Í¥‰±”€˜˜€ (€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰…‘µ¥¸µ±…Õ¹¡•Èˆ½¹±¥¬õì ¤€ôøÍ•Ñ‘µ¥¹=Á•¸¡ÑÉÕ”¥ô…É¥„µ¡…ÍÁ½ÁÕÀô‰‘¥…±½œˆø(€€€€€€€€€€ñÍÁ…¸…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆûŠr˜ğ½ÍÁ…¸ø‘µ¥¹¥ÍÑÉ…È(€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€¥ô(€€€€€í¥Í‘µ¥¸€˜˜…‘µ¥¹=Á•¸€˜˜ÕÍ•È€˜˜€ (€€€€€€€€ñ‘µ¥¹A…¹•°(€€€€€€€€€…‘µ¥¹µ…¥°õíÕÍ•È¹•µ…¥±ô(€€€€€€€€€½¹™¥œõíÍ¥Ñ•½¹™¥ô(€€€€€€€€€É•Ù¥Í¥½¸õíÕÉÉ•¹Ñ½¹™¥I•Ù¥Í¥½¹ô(€€€€€€€€€½¹±½Í”õì ¤€ôøÍ•Ñ‘µ¥¹=Á•¸¡™…±Í”¥ô(€€€€€€€€€½¹M…Ù•õì¡¹•áÑ½¹™¥œ°¹•áÑI•Ù¥Í¥½¸¤€ôøì(€€€€€€€€€€€½¹ÍĞÍ•±•Ñ•‘I½±”€ô™¥¹‘½¹™¥ÕÉ•‘=ÕÁ…Ñ¥½¸¡Í¥Ñ•½¹™¥œ°É½±•Q¥Ñ±”¤ì(€€€€€€€€€€€Í•ÑM¥Ñ•½¹™¥œ¡¹•áÑ½¹™¥œ¤ì(€€€€€€€€€€€Í•ÑÕÉÉ•¹Ñ½¹™¥I•Ù¥Í¥½¸¡¹•áÑI•Ù¥Í¥½¸¤ì(€€€€€€€€€€€Í•Ñ½µÁ…¹åM•Ñ½É% ¡ÕÉÉ•¹Ğ¤€ôø¹•áÑ½¹™¥œ¹Í•Ñ½ÉÌ¹Í½µ” ¡Í•Ñ½È¤€ôøÍ•Ñ½È¹¥€ôôôÕÉÉ•¹Ğ¤€üÕÉÉ•¹Ğ€è€ˆˆ¤ì(€€€€€€€€€€€Í•Ñ½µÁ…¹åAÉ¥½É¥Ñå%‘Ì ¡ÕÉÉ•¹Ğ¤€ôøÕÉÉ•¹Ğ¹™¥±Ñ•È ¡¥¤€ôø¹•áÑ½¹™¥œ¹ÁÉ¥½É¥Ñ¥•Ì¹Í½µ” ¡ÁÉ¥½É¥Ñä¤€ôøÁÉ¥½É¥Ñä¹¥€ôôô¥¤¤¤ì(€€€€€€€€€€€¥˜€¡Í•±•Ñ•‘I½±”¤ì(€€€€€€€€€€€€€Í•ÑI½±•Q¥Ñ±”¡¹•áÑ½¹™¥œ¹½ÕÁ…Ñ¥½¹Ì¹™¥¹ ¡½ÕÁ…Ñ¥½¸¤€ôø½ÕÁ…Ñ¥½¸¹¥€ôôôÍ•±•Ñ•‘I½±”¹¥¤ü¹Ñ¥Ñ±”€üü‘•™…Õ±ÑI½±•Q¥Ñ±”¡¹•áÑ½¹™¥œ¤¤ì(€€€€€€€€€€€ô(€€€€€€€€€õô(€€€€€€€€¼ø(€€€€€€¥ô(€€€€ğ½µ…¥¸ø(€€¤ì)ô()™Õ¹Ñ¥½¸AÉ•Ù¥•İ	…È¡ì±…‰•°°Ù…±Õ”ôèì±…‰•°èÍÑÉ¥¹œìÙ…±Õ”è¹Õµ‰•Èô¤ì(€É•ÑÕÉ¸€ñ‘¥ØøñÍÁ…¸ùí±…‰•±ôñˆùíÙ…±Õ•ô”ğ½ˆøğ½ÍÁ…¸øñ¤øñ•´ÍÑå±”õíìİ¥‘Ñ è€‘íÙ…±Õ•ô•€õô€¼øğ½¤øğ½‘¥Øøì)ô()™Õ¹Ñ¥½¸‘•™…Õ±ÑI½±•Q¥Ñ±”¡½¹™¥œèM¥Ñ•½¹™¥œ¤èÍÑÉ¥¹œì(€É•ÑÕÉ¸½¹™¥œ¹½ÕÁ…Ñ¥½¹Ì¹™¥¹ ¡½ÕÁ…Ñ¥½¸¤€ôø½ÕÁ…Ñ¥½¸¹¥€ôôô€‰…¹…±¥ÍÑ„µ‘”µ‘…‘½Ìˆñğ½ÕÁ…Ñ¥½¸¹Ñ¥Ñ±”€ôôô€‰¹…±¥ÍÑ„‘”…‘½Ìˆ¤ü¹Ñ¥Ñ±”(€€€€üü½¹™¥œ¹½ÕÁ…Ñ¥½¹ÍlÁtü¹Ñ¥Ñ±”(€€€€üü€ˆˆì)ô()™Õ¹Ñ¥½¸É¥Ñ•É¥½¸¡ì¥½¸°Ñ¥Ñ±”°İ•¥¡Ğ°Ñ•áĞôèì¥½¸èÍÑÉ¥¹œìÑ¥Ñ±”èÍÑÉ¥¹œìİ•¥¡ĞèÍÑÉ¥¹œìÑ•áĞèÍÑÉ¥¹œô¤ì(€É•ÑÕÉ¸€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥Ñ•É¥½¸ˆøñÍÁ…¸±…ÍÍ9…µ”ô‰É¥Ñ•É¥½¸µ¥½¸ˆùí¥½¹ôğ½ÍÁ…¸øñÀøñÍÑÉ½¹œùíÑ¥Ñ±•ôğ½ÍÑÉ½¹œøñÍµ…±°ùíÑ•áÑôğ½Íµ…±°øğ½Àøñˆùíİ•¥¡Ñôğ½ˆøğ½‘¥Øøì)ô()™Õ¹Ñ¥½¸!½İ…É¡ì¹Õµ‰•È°Íåµ‰½°°Ñ¥Ñ±”°Ñ•áĞôèì¹Õµ‰•ÈèÍÑÉ¥¹œìÍåµ‰½°èÍÑÉ¥¹œìÑ¥Ñ±”èÍÑÉ¥¹œìÑ•áĞèÍÑÉ¥¹œô¤ì(€É•ÑÕÉ¸€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰¡½Üµ…ÉˆøñÍÁ…¸±…ÍÍ9…µ”ô‰¡½Üµ¹Õµ‰•Èˆùí¹Õµ‰•Éôğ½ÍÁ…¸øñÍÁ…¸±…ÍÍ9…µ”ô‰¡½ÜµÍåµ‰½°ˆùíÍåµ‰½±ôğ½ÍÁ…¸øñ ÌùíÑ¥Ñ±•ôğ½ ÌøñÀùíÑ•áÑôğ½Àøğ½…ÉÑ¥±”øì)ô()…Íå¹Œ™Õ¹Ñ¥½¸•áÑÉ…ÑI•ÍÕµ•Q•áĞ¡™¥±”è¥±”¤èAÉ½µ¥Í”ñÍÑÉ¥¹œøì(€½¹ÍĞ•áÑ•¹Í¥½¸€ô™¥±”¹¹…µ”¹ÍÁ±¥Ğ ˆ¸ˆ¤¹Á½À ¤ü¹Ñ½1½İ•É…Í” ¤ì(€¥˜€¡•áÑ•¹Í¥½¸€ôôô€‰ÑáĞˆñğ•áÑ•¹Í¥½¸€ôôô€‰µˆñğ™¥±”¹ÑåÁ”¹ÍÑ…ÉÑÍ]¥Ñ  ‰Ñ•áĞ¼ˆ¤¤É•ÑÕÉ¸™¥±”¹Ñ•áĞ ¤ì(€¥˜€¡•áÑ•¹Í¥½¸€ôôô€‰‘½àˆ¤ì(€€€½¹ÍĞµ…µµ½Ñ €ô…İ…¥Ğ¥µÁ½ÉĞ ‰µ…µµ½Ñ ˆ¤ì(€€€½¹ÍĞÉ•ÍÕ±Ğ€ô…İ…¥Ğµ…µµ½Ñ ¹•áÑÉ…ÑI…İQ•áĞ¡ì…ÉÉ…å	Õ™™•Èè…İ…¥Ğ™¥±”¹…ÉÉ…å	Õ™™•È ¤ô¤ì(€€€É•ÑÕÉ¸É•ÍÕ±Ğ¹Ù…±Õ”ì(€ô(€¥˜€¡•áÑ•¹Í¥½¸€ôôô€‰Á‘˜ˆñğ™¥±”¹ÑåÁ”€ôôô€‰…ÁÁ±¥…Ñ¥½¸½Á‘˜ˆ¤ì(€€€½¹ÍĞÁ‘™©Ì€ô…İ…¥Ğ¥µÁ½ÉĞ ‰Á‘™©Ìµ‘¥ÍĞ½±•…ä½‰Õ¥±½Á‘˜¹µ©Ìˆ¤ì(€€€½¹ÍĞİ½É­•È€ô…İ…¥Ğ¥µÁ½ÉĞ ‰Á‘™©Ìµ‘¥ÍĞ½±•…ä½‰Õ¥±½Á‘˜¹İ½É­•È¹µ¥¸¹µ©ÌıÕÉ°ˆ¤ì(€€€Á‘™©Ì¹±½‰…±]½É­•É=ÁÑ¥½¹Ì¹İ½É­•ÉMÉŒ€ôİ½É­•È¹‘•™…Õ±Ğì(€€€½¹ÍĞ‘½Õµ•¹Ğ€ô…İ…¥ĞÁ‘™©Ì¹•Ñ½Õµ•¹Ğ¡ì‘…Ñ„è¹•ÜU¥¹ĞáÉÉ…ä¡…İ…¥Ğ™¥±”¹…ÉÉ…å	Õ™™•È ¤¤ô¤¹ÁÉ½µ¥Í”ì(€€€½¹ÍĞÁ…•ÌèÍÑÉ¥¹mt€ômtì(€€€™½È€¡±•ĞÁ…•9Õµ‰•È€ô€ÄìÁ…•9Õµ‰•È€ğô‘½Õµ•¹Ğ¹¹ÕµA…•ÌìÁ…•9Õµ‰•È€¬ô€Ä¤ì(€€€€€½¹ÍĞÁ…”€ô…İ…¥Ğ‘½Õµ•¹Ğ¹•ÑA…”¡Á…•9Õµ‰•È¤ì(€€€€€½¹ÍĞ½¹Ñ•¹Ğ€ô…İ…¥ĞÁ…”¹•ÑQ•áÑ½¹Ñ•¹Ğ ¤ì(€€€€€Á…•Ì¹ÁÕÍ ¡½¹Ñ•¹Ğ¹¥Ñ•µÌ¹µ…À ¡¥Ñ•´¤€ôø€ ‰ÍÑÈˆ¥¸¥Ñ•´€ü¥Ñ•´¹ÍÑÈ€è€ˆˆ¤¤¹©½¥¸ ˆ€ˆ¤¤ì(€€€ô(€€€É•ÑÕÉ¸Á…•Ì¹©½¥¸ ‰q¸ˆ¤ì(€ô(€Ñ¡É½Ü¹•ÜÉÉ½È ‰½Éµ…Ñ¼»¼É•½¹¡•¥‘¼¸ˆ¤ì)ô()™Õ¹Ñ¥½¸™½Éµ…Ñ	åÑ•Ì¡‰åÑ•Ìè¹Õµ‰•È¤èÍÑÉ¥¹œì(€É•ÑÕÉ¸‰åÑ•Ì€ğ€ÄÀÈĞ€¨€ÄÀÈĞ€ü€‘í5…Ñ ¹µ…à Ä°5…Ñ ¹É½Õ¹¡‰åÑ•Ì€¼€ÄÀÈĞ¤¥ô-	€€è€‘ì¡‰åÑ•Ì€¼€ÄÀÈĞ€¼€ÄÀÈĞ¤¹Ñ½¥á• Ä¥ô5	€ì)ô()™Õ¹Ñ¥½¸™¥ÉÍÑ9…µ”¡Ù…±Õ”èÍÑÉ¥¹œ¤èÍÑÉ¥¹œì(€½¹ÍĞ¹½Éµ…±¥é•€ôÙ…±Õ”¹¥¹±Õ‘•Ì ‰ ˆ¤€üÙ…±Õ”¹ÍÁ±¥Ğ ‰ ˆ¥lÁt€èÙ…±Õ”ì(€É•ÑÕÉ¸¹½Éµ…±¥é•¹ÑÉ¥´ ¤¹ÍÁ±¥Ğ ½qÌ¬¼¥lÁtñğ€‰Y½¨ˆì)ô()™Õ¹Ñ¥½¸™½Éµ…Ñ…Ñ”¡Ù…±Õ”èÍÑÉ¥¹œ¤èÍÑÉ¥¹œì(€½¹ÍĞ¹½Éµ…±¥é•€ôÙ…±Õ”¹¥¹±Õ‘•Ì ‰Pˆ¤€üÙ…±Õ”€è€‘íÙ…±Õ”¹É•Á±…” ˆ€ˆ°€‰Pˆ¥õi€ì(€½¹ÍĞ‘…Ñ”€ô¹•Ü…Ñ”¡¹½Éµ…±¥é•¤ì(€¥˜€¡9Õµ‰•È¹¥Í9…8¡‘…Ñ”¹•ÑQ¥µ” ¤¤¤É•ÑÕÉ¸Ù…±Õ”ì(€É•ÑÕÉ¸¹•Ü%¹Ñ°¹…Ñ•Q¥µ•½Éµ…Ğ ‰ÁĞµ	Hˆ°ì‘…äè€ˆÈµ‘¥¥Ğˆ°µ½¹Ñ è€‰Í¡½ÉĞˆô¤¹™½Éµ…Ğ¡‘…Ñ”¤¹É•Á±…” ˆ¸ˆ°€ˆˆ¤ì)ô()™Õ¹Ñ¥½¸Í½É•±…ÍÌ¡Í½É”è¹Õµ‰•È¤èÍÑÉ¥¹œì(€¥˜€¡Í½É”€øô€àÀ¤É•ÑÕÉ¸€‰¡¥ ˆì(€¥˜€¡Í½É”€øô€ÔÔ¤É•ÑÕÉ¸€‰µ•‘¥Õ´ˆì(€É•ÑÕÉ¸€‰±½Üˆì)ô