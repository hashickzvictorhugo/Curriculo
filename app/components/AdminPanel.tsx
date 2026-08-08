"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ROLE_PROFILES } from "../../lib/role-catalog";
import type {
  EditableOccupation,
  SiteConfig,
  SiteContent,
} from "../../lib/site-config";

type AdminTab = "content" | "scoring" | "roles" | "company";

type AdminPanelProps = {
  adminEmail: string;
  config: SiteConfig;
  revision: number;
  onClose: () => void;
  onSaved: (config: SiteConfig, revision: number) => void;
};

const CONTENT_FIELDS: Array<{
  group: string;
  fields: Array<{ key: keyof SiteContent; label: string; multiline?: boolean }>;
}> = [
  {
    group: "Apresentação principal",
    fields: [
      { key: "heroEyebrow", label: "Selo acima do título" },
      { key: "heroTitleLead", label: "Título principal" },
      { key: "heroTitleAccent", label: "Trecho destacado do título" },
      { key: "heroDescription", label: "Descrição principal", multiline: true },
      { key: "heroPrimaryCta", label: "Botão principal" },
      { key: "heroSecondaryCta", label: "Link secundário" },
      { key: "heroTrustRoles", label: "Indicador de cargos" },
      { key: "heroTrustDimensions", label: "Indicador de dimensões" },
      { key: "heroTrustExplainable", label: "Indicador de explicabilidade" },
    ],
  },
  {
    group: "Área de análise",
    fields: [
      { key: "analysisKicker", label: "Selo" },
      { key: "analysisTitle", label: "Título" },
      { key: "analysisDescription", label: "Descrição", multiline: true },
    ],
  },
  {
    group: "Formulário e critérios",
    fields: [
      { key: "companyStepTitle", label: "Título da etapa empresa" },
      { key: "companyStepDescription", label: "Descrição da etapa empresa", multiline: true },
      { key: "roleStepTitle", label: "Título da etapa vaga" },
      { key: "roleStepDescription", label: "Descrição da etapa vaga", multiline: true },
      { key: "resumeStepTitle", label: "Título da etapa currículo" },
      { key: "resumeStepDescription", label: "Descrição da etapa currículo", multiline: true },
      { key: "analyzeButtonLabel", label: "Botão de analisar" },
      { key: "analysisPrivacyNote", label: "Aviso abaixo do botão", multiline: true },
      { key: "criteriaKicker", label: "Selo dos critérios" },
      { key: "criteriaTitle", label: "Título dos critérios" },
      { key: "criteriaDescription", label: "Descrição dos critérios", multiline: true },
      { key: "criteriaTipTitle", label: "Título da dica de pesos" },
      { key: "criteriaTipDescription", label: "Descrição da dica de pesos", multiline: true },
    ],
  },
  {
    group: "Como funciona",
    fields: [
      { key: "howKicker", label: "Selo" },
      { key: "howTitle", label: "Título" },
      { key: "howDescription", label: "Descrição", multiline: true },
      { key: "howStep1Title", label: "Título do passo 1" },
      { key: "howStep1Description", label: "Descrição do passo 1", multiline: true },
      { key: "howStep2Title", label: "Título do passo 2" },
      { key: "howStep2Description", label: "Descrição do passo 2", multiline: true },
      { key: "howStep3Title", label: "Título do passo 3" },
      { key: "howStep3Description", label: "Descrição do passo 3", multiline: true },
    ],
  },
  {
    group: "Histórico e privacidade",
    fields: [
      { key: "historyKicker", label: "Selo do histórico" },
      { key: "historyTitle", label: "Título do histórico" },
      { key: "historyDescription", label: "Descrição do histórico", multiline: true },
      { key: "securityKicker", label: "Selo de privacidade" },
      { key: "securityTitle", label: "Título de privacidade" },
      { key: "securityDescription", label: "Descrição de privacidade", multiline: true },
      { key: "securityPoint1", label: "Ponto de privacidade 1" },
      { key: "securityPoint2", label: "Ponto de privacidade 2" },
      { key: "securityPoint3", label: "Ponto de privacidade 3" },
    ],
  },
  {
    group: "Chamada final e rodapé",
    fields: [
      { key: "finalKicker", label: "Selo da chamada final" },
      { key: "finalTitle", label: "Título da chamada final" },
      { key: "finalDescription", label: "Descrição da chamada final", multiline: true },
      { key: "finalCtaLabel", label: "Botão da chamada final" },
      { key: "footerTagline", label: "Frase do rodapé" },
    ],
  },
];

const WEIGHT_FIELDS: Array<{ key: keyof SiteConfig["weights"]; label: string; help: string }> = [
  { key: "skills", label: "Competências técnicas", help: "Ferramentas e conhecimentos da família profissional." },
  { key: "experience", label: "Experiência", help: "Tempo profissional encontrado no currículo." },
  { key: "vacancy", label: "Descrição da vaga", help: "Termos específicos do anúncio." },
  { key: "company", label: "Contexto da empresa", help: "Setor, prioridades e texto institucional." },
  { key: "softSkills", label: "Comportamental", help: "Comunicação, organização e colaboração." },
  { key: "education", label: "Formação", help: "Formação superior ou técnica identificada." },
];

export function AdminPanel({ adminEmail, config, revision, onClose, onSaved }: AdminPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<AdminTab>("content");
  const [baseline, setBaseline] = useState(() => cloneConfig(config));
  const [draft, setDraft] = useState(() => cloneConfig(config));
  const [currentRevision, setCurrentRevision] = useState(revision);
  const [roleSearch, setRoleSearch] = useState("");
  const [companyView, setCompanyView] = useState<"sectors" | "priorities">("sectors");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  const weightTotal = Object.values(draft.weights).reduce((total, value) => total + Number(value || 0), 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving && dirty && weightTotal === 100) void save();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  function requestClose() {
    if (dirty && !window.confirm("Descartar as alterações que ainda não foram salvas?")) return;
    onClose();
  }

  async function save() {
    setError("");
    setNotice("");
    if (weightTotal !== 100) {
      setError("Os pesos precisam somar exatamente 100% antes de salvar.");
      setTab("scoring");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedRevision: currentRevision, config: draft }),
      });
      const payload = await response.json() as {
        config?: SiteConfig;
        revision?: number;
        error?: string;
      };
      if (!response.ok || !payload.config || typeof payload.revision !== "number") {
        throw new Error(payload.error || "Não foi possível salvar as alterações.");
      }
      const normalized = cloneConfig(payload.config);
      setDraft(normalized);
      setBaseline(cloneConfig(normalized));
      setCurrentRevision(payload.revision);
      onSaved(normalized, payload.revision);
      setNotice("Alterações salvas e já aplicadas ao site.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  const normalizedSearch = roleSearch.trim().toLocaleLowerCase("pt-BR");
  const filteredRoles = draft.occupations
    .map((occupation, index) => ({ occupation, index }))
    .filter(({ occupation }) => !normalizedSearch || `${occupation.title} ${occupation.area}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch));

  function addRole() {
    const nextRole: EditableOccupation = {
      id: `novo-cargo-${Date.now()}`,
      title: "Novo cargo",
      area: "Outras áreas",
      profileId: "generic",
      aliases: [],
      skillKeywords: [],
    };
    setDraft((current) => ({ ...current, occupations: [nextRole, ...current.occupations] }));
    setRoleSearch("Novo cargo");
  }

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      aria-labelledby="admin-panel-title"
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
    >
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">NexoCV • acesso protegido</span>
            <h2 id="admin-panel-title">Painel administrativo</h2>
            <p>{adminEmail}</p>
          </div>
          <button type="button" className="admin-close" onClick={requestClose} aria-label="Fechar painel">×</button>
        </header>

        <div className="admin-tabs" role="group" aria-label="Seções do painel">
          <AdminTabButton active={tab === "content"} onClick={() => setTab("content")}>Conteúdo</AdminTabButton>
          <AdminTabButton active={tab === "scoring"} onClick={() => setTab("scoring")}>Pontuação</AdminTabButton>
          <AdminTabButton active={tab === "roles"} onClick={() => setTab("roles")}>Cargos <span>{draft.occupations.length}</span></AdminTabButton>
          <AdminTabButton active={tab === "company"} onClick={() => setTab("company")}>Empresa</AdminTabButton>
        </div>

        <div className="admin-body">
          {tab === "content" && (
            <div className="admin-editor-stack">
              <AdminIntro title="Textos do site" text="Edite o conteúdo público sem usar HTML. A página muda assim que você salvar." />
              {CONTENT_FIELDS.map((group) => (
                <section className="admin-section-card" key={group.group}>
                  <h3>{group.group}</h3>
                  <div className="admin-form-grid">
                    {group.fields.map((field) => (
                      <label className={`admin-field ${field.multiline ? "wide" : ""}`} key={field.key}>
                        <span>{field.label}</span>
                        {field.multiline ? (
                          <textarea
                            rows={3}
                            value={draft.content[field.key]}
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              content: { ...current.content, [field.key]: event.target.value },
                            }))}
                          />
                        ) : (
                          <input
                            value={draft.content[field.key]}
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              content: { ...current.content, [field.key]: event.target.value },
                            }))}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {tab === "scoring" && (
            <div className="admin-editor-stack">
              <AdminIntro title="Composição da nota" text="A soma deve dar 100%. Dimensões opcionais ausentes continuam tendo o peso redistribuído." />
              <div className={`admin-total-card ${weightTotal === 100 ? "valid" : "invalid"}`}>
                <span>Total configurado</span><strong>{weightTotal}%</strong><small>{weightTotal === 100 ? "Pronto para salvar" : "Ajuste até chegar a 100%"}</small>
              </div>
              <section className="admin-section-card">
                <div className="admin-weight-grid">
                  {WEIGHT_FIELDS.map((field) => (
                    <label className="admin-weight-field" key={field.key}>
                      <span><strong>{field.label}</strong><small>{field.help}</small></span>
                      <span className="admin-weight-control">
                        <input
                          type="range"
                          min="0"
                          max="70"
                          value={draft.weights[field.key]}
                          onChange={(event) => setDraft((current) => ({
                            ...current,
                            weights: { ...current.weights, [field.key]: Number(event.target.value) },
                          }))}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={draft.weights[field.key]}
                          onChange={(event) => setDraft((current) => ({
                            ...current,
                            weights: { ...current.weights, [field.key]: Number(event.target.value) },
                          }))}
                          aria-label={`Peso de ${field.label}`}
                        />
                        <b>%</b>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === "roles" && (
            <div className="admin-editor-stack">
              <AdminIntro title="Catálogo de cargos" text="Renomeie, adicione ou remova cargos. A família define o perfil técnico; palavras-chave próprias substituem esse perfil quando preenchidas." />
              <div className="admin-toolbar">
                <label className="admin-search"><span className="sr-only">Buscar cargo</span><input value={roleSearch} onChange={(event) => setRoleSearch(event.target.value)} placeholder="Buscar por cargo ou área..." /></label>
                <button type="button" className="admin-add-button" onClick={addRole}>+ Adicionar cargo</button>
              </div>
              <p className="admin-list-count">{filteredRoles.length} cargo{filteredRoles.length === 1 ? "" : "s"} encontrado{filteredRoles.length === 1 ? "" : "s"}{filteredRoles.length > 60 ? " • mostrando os primeiros 60" : ""}</p>
              <div className="admin-list">
                {filteredRoles.slice(0, 60).map(({ occupation, index }) => (
                  <article className="admin-item-card" key={occupation.id}>
                    <div className="admin-item-heading"><strong>{occupation.title || "Cargo sem nome"}</strong><button type="button" aria-label={`Excluir cargo ${occupation.title || "sem nome"}`} onClick={() => setDraft((current) => ({ ...current, occupations: current.occupations.filter((_, itemIndex) => itemIndex !== index) }))}>Excluir</button></div>
                    <div className="admin-form-grid three">
                      <AdminTextField label="Nome do cargo" value={occupation.title} onChange={(value) => updateRole(index, { title: value })} />
                      <AdminTextField label="Área" value={occupation.area} onChange={(value) => updateRole(index, { area: value })} />
                      <label className="admin-field"><span>Família de análise</span><select value={occupation.profileId} onChange={(event) => updateRole(index, { profileId: event.target.value })}><option value="generic">Perfil genérico</option>{ROLE_PROFILES.map((profile) => <option key={profile.id} value={profile.id}>{profile.title}</option>)}</select></label>
                      <AdminTextField className="wide" label="Nomes alternativos (separados por vírgula)" value={occupation.aliases.join(", ")} onChange={(value) => updateRole(index, { aliases: splitList(value) })} />
                      <AdminTextField className="wide" label="Palavras-chave próprias (opcional)" value={occupation.skillKeywords.join(", ")} onChange={(value) => updateRole(index, { skillKeywords: splitList(value) })} />
                    </div>
                  </article>
                ))}
                {!filteredRoles.length && <div className="admin-empty">Nenhum cargo corresponde à busca.</div>}
              </div>
            </div>
          )}

          {tab === "company" && (
            <div className="admin-editor-stack">
              <AdminIntro title="Contexto das empresas" text="Os termos abaixo são comparados com o currículo e influenciam a dimensão da empresa." />
              <div className="admin-segmented">
                <button type="button" className={companyView === "sectors" ? "active" : ""} onClick={() => setCompanyView("sectors")}>Setores ({draft.sectors.length})</button>
                <button type="button" className={companyView === "priorities" ? "active" : ""} onClick={() => setCompanyView("priorities")}>Prioridades ({draft.priorities.length})</button>
              </div>
              {companyView === "sectors" ? (
                <CompanyOptionEditor
                  items={draft.sectors}
                  noun="setor"
                  onAdd={() => setDraft((current) => ({ ...current, sectors: [...current.sectors, { id: `setor-${Date.now()}`, label: "Novo setor", aliases: [] }] }))}
                  onChange={(index, item) => setDraft((current) => ({ ...current, sectors: current.sectors.map((currentItem, itemIndex) => itemIndex === index ? item : currentItem) }))}
                  onDelete={(index) => setDraft((current) => ({ ...current, sectors: current.sectors.filter((_, itemIndex) => itemIndex !== index) }))}
                />
              ) : (
                <CompanyOptionEditor
                  items={draft.priorities}
                  noun="prioridade"
                  onAdd={() => setDraft((current) => ({ ...current, priorities: [...current.priorities, { id: `prioridade-${Date.now()}`, label: "Nova prioridade", aliases: [] }] }))}
                  onChange={(index, item) => setDraft((current) => ({ ...current, priorities: current.priorities.map((currentItem, itemIndex) => itemIndex === index ? item : currentItem) }))}
                  onDelete={(index) => setDraft((current) => ({ ...current, priorities: current.priorities.filter((_, itemIndex) => itemIndex !== index) }))}
                />
              )}
            </div>
          )}
        </div>

        <div className="admin-savebar">
          <div aria-live="polite">
            {error ? <p className="admin-error" role="alert">{error}</p> : notice ? <p className="admin-success">✓ {notice}</p> : <p>{dirty ? "Alterações ainda não salvas" : `Tudo salvo • revisão ${currentRevision}`}</p>}
          </div>
          <div>
            <button type="button" className="admin-discard" disabled={!dirty || saving} onClick={() => { setDraft(cloneConfig(baseline)); setError(""); setNotice(""); }}>Descartar</button>
            <button type="button" className="admin-save" disabled={!dirty || saving || weightTotal !== 100} onClick={() => void save()} aria-busy={saving}>{saving ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </div>
      </div>
    </dialog>
  );

  function updateRole(index: number, patch: Partial<EditableOccupation>) {
    setDraft((current) => ({
      ...current,
      occupations: current.occupations.map((occupation, itemIndex) => itemIndex === index ? { ...occupation, ...patch } : occupation),
    }));
  }
}

function AdminTabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" aria-pressed={active} className={active ? "active" : ""} onClick={onClick}>{children}</button>;
}

function AdminIntro({ title, text }: { title: string; text: string }) {
  return <div className="admin-intro"><h3>{title}</h3><p>{text}</p></div>;
}

function AdminTextField({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`admin-field ${className}`}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function CompanyOptionEditor<T extends { id: string; label: string; aliases: string[] }>({
  items,
  noun,
  onAdd,
  onChange,
  onDelete,
}: {
  items: T[];
  noun: "setor" | "prioridade";
  onAdd: () => void;
  onChange: (index: number, item: T) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <div className="admin-list">
      <button type="button" className="admin-add-button align-start" onClick={onAdd}>+ Adicionar {noun}</button>
      {items.map((item, index) => (
        <article className="admin-item-card compact" key={item.id}>
          <div className="admin-item-heading"><strong>{item.label || `${noun} sem nome`}</strong><button type="button" aria-label={`Excluir ${noun} ${item.label || "sem nome"}`} disabled={item.id === "other"} title={item.id === "other" ? "O setor multissetorial é necessário como opção de segurança." : undefined} onClick={() => onDelete(index)}>Excluir</button></div>
          <div className="admin-form-grid">
            <AdminTextField label="Nome exibido" value={item.label} onChange={(value) => onChange(index, { ...item, label: value })} />
            <AdminTextField label="Termos que influenciam a nota" value={item.aliases.join(", ")} onChange={(value) => onChange(index, { ...item, aliases: splitList(value) })} />
          </div>
        </article>
      ))}
    </div>
  );
}

function splitList(value: string): string[] {
  const items = value.split(",").map((item) => item.trim());
  return /,\s*$/.test(value) ? items : items.filter(Boolean);
}

function cloneConfig(config: SiteConfig): SiteConfig {
  return JSON.parse(JSON.stringify(config)) as SiteConfig;
}
