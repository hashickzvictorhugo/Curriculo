import {
  COMPANY_PRIORITIES,
  COMPANY_SECTORS,
  type CompanyPriority,
  type CompanySector,
} from "./company-catalog";
import {
  OCCUPATIONS,
  ROLE_PROFILES,
  type OccupationOption,
} from "./role-catalog";

export type SiteContent = {
  heroEyebrow: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroTrustRoles: string;
  heroTrustDimensions: string;
  heroTrustExplainable: string;
  analysisKicker: string;
  analysisTitle: string;
  analysisDescription: string;
  companyStepTitle: string;
  companyStepDescription: string;
  roleStepTitle: string;
  roleStepDescription: string;
  resumeStepTitle: string;
  resumeStepDescription: string;
  analyzeButtonLabel: string;
  analysisPrivacyNote: string;
  criteriaKicker: string;
  criteriaTitle: string;
  criteriaDescription: string;
  criteriaTipTitle: string;
  criteriaTipDescription: string;
  howKicker: string;
  howTitle: string;
  howDescription: string;
  howStep1Title: string;
  howStep1Description: string;
  howStep2Title: string;
  howStep2Description: string;
  howStep3Title: string;
  howStep3Description: string;
  historyKicker: string;
  historyTitle: string;
  historyDescription: string;
  securityKicker: string;
  securityTitle: string;
  securityDescription: string;
  securityPoint1: string;
  securityPoint2: string;
  securityPoint3: string;
  finalKicker: string;
  finalTitle: string;
  finalDescription: string;
  finalCtaLabel: string;
  footerTagline: string;
};

export type ScoringWeights = {
  skills: number;
  experience: number;
  vacancy: number;
  company: number;
  softSkills: number;
  education: number;
};

export type EditableOccupation = OccupationOption & {
  skillKeywords: string[];
};

export type SiteConfig = {
  content: SiteContent;
  weights: ScoringWeights;
  occupations: EditableOccupation[];
  sectors: CompanySector[];
  priorities: CompanyPriority[];
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroEyebrow: "Análise clara, sem adivinhação",
  heroTitleLead: "Seu currículo está falando a",
  heroTitleAccent: "língua da vaga?",
  heroDescription: "Compare experiências, habilidades e palavras-chave. Em poucos instantes, entenda onde você combina com a oportunidade e o que ajustar antes de enviar.",
  heroPrimaryCta: "Analisar meu currículo",
  heroSecondaryCta: "Veja como funciona",
  heroTrustRoles: "cargos sugeridos",
  heroTrustDimensions: "até 6 dimensões avaliadas",
  heroTrustExplainable: "Resultado explicável",
  analysisKicker: "Faça sua análise",
  analysisTitle: "Uma comparação que você consegue entender.",
  analysisDescription: "Nada de nota solta: cada ponto vem acompanhado do motivo e de um próximo passo.",
  companyStepTitle: "Em qual empresa fica essa oportunidade?",
  companyStepDescription: "O setor e as prioridades entram de verdade na compatibilidade.",
  roleStepTitle: "Qual é a vaga?",
  roleStepDescription: "Busque nas sugestões ou digite qualquer profissão.",
  resumeStepTitle: "Agora, envie seu currículo",
  resumeStepDescription: "O arquivo é lido com segurança para fazer a comparação.",
  analyzeButtonLabel: "Ver minha compatibilidade",
  analysisPrivacyNote: "Sua análise é privada. O resultado é orientativo e não substitui a avaliação humana.",
  criteriaKicker: "O que entra na nota",
  criteriaTitle: "Critérios objetivos, peso transparente.",
  criteriaDescription: "O NexoCV compara evidências do currículo com a função, o anúncio e o contexto profissional da empresa.",
  criteriaTipTitle: "Pesos inteligentes",
  criteriaTipDescription: "Quando um contexto opcional não é informado, o peso é redistribuído sem inventar uma nota neutra.",
  howKicker: "Do arquivo ao plano de ação",
  howTitle: "Três passos. Nenhuma caixa-preta.",
  howDescription: "Você entende o resultado e sai sabendo exatamente o que fazer.",
  howStep1Title: "Envie o currículo",
  howStep1Description: "PDF, Word ou texto. A leitura acontece sem você precisar reorganizar o documento.",
  howStep2Title: "Contextualize a oportunidade",
  howStep2Description: "Informe cargo, setor, prioridades da empresa e, se tiver, cole o anúncio completo.",
  howStep3Title: "Receba o diagnóstico",
  howStep3Description: "Veja vaga e empresa separadas na nota, além de lacunas e recomendações práticas.",
  historyKicker: "Seu progresso em um só lugar",
  historyTitle: "Compare oportunidades sem perder o histórico.",
  historyDescription: "Quando sua conta está conectada, cada análise fica salva para você voltar, comparar notas e acompanhar a evolução do currículo.",
  securityKicker: "Privacidade desde o começo",
  securityTitle: "Currículo é pessoal. Tratamos como tal.",
  securityDescription: "O arquivo é usado para gerar sua análise e fica associado somente à sua conta. Não vendemos currículos nem usamos a nota como decisão automática de contratação.",
  securityPoint1: "Histórico privado",
  securityPoint2: "Arquivos protegidos",
  securityPoint3: "Resultado explicável",
  finalKicker: "Antes do próximo “candidatar-se”",
  finalTitle: "Descubra o que o recrutador precisa enxergar.",
  finalDescription: "Compare agora e transforme seu currículo em uma candidatura mais objetiva.",
  finalCtaLabel: "Analisar meu currículo",
  footerTagline: "Compatibilidade com clareza. Decisões com contexto.",
};

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skills: 36,
  experience: 20,
  vacancy: 20,
  company: 12,
  softSkills: 7,
  education: 5,
};

const CONTENT_LIMITS: Record<keyof SiteContent, number> = {
  heroEyebrow: 100,
  heroTitleLead: 120,
  heroTitleAccent: 100,
  heroDescription: 500,
  heroPrimaryCta: 80,
  heroSecondaryCta: 80,
  heroTrustRoles: 100,
  heroTrustDimensions: 100,
  heroTrustExplainable: 100,
  analysisKicker: 100,
  analysisTitle: 160,
  analysisDescription: 500,
  companyStepTitle: 160,
  companyStepDescription: 300,
  roleStepTitle: 160,
  roleStepDescription: 300,
  resumeStepTitle: 160,
  resumeStepDescription: 300,
  analyzeButtonLabel: 100,
  analysisPrivacyNote: 300,
  criteriaKicker: 100,
  criteriaTitle: 160,
  criteriaDescription: 500,
  criteriaTipTitle: 100,
  criteriaTipDescription: 300,
  howKicker: 100,
  howTitle: 160,
  howDescription: 500,
  howStep1Title: 120,
  howStep1Description: 400,
  howStep2Title: 120,
  howStep2Description: 400,
  howStep3Title: 120,
  howStep3Description: 400,
  historyKicker: 100,
  historyTitle: 160,
  historyDescription: 600,
  securityKicker: 100,
  securityTitle: 160,
  securityDescription: 600,
  securityPoint1: 100,
  securityPoint2: 100,
  securityPoint3: 100,
  finalKicker: 100,
  finalTitle: 160,
  finalDescription: 500,
  finalCtaLabel: 100,
  footerTagline: 180,
};

const PROFILE_IDS = new Set(["generic", ...ROLE_PROFILES.map((profile) => profile.id)]);

export function getDefaultSiteConfig(): SiteConfig {
  return {
    content: { ...DEFAULT_SITE_CONTENT },
    weights: { ...DEFAULT_SCORING_WEIGHTS },
    occupations: OCCUPATIONS.map((occupation) => ({
      ...occupation,
      aliases: [...occupation.aliases],
      skillKeywords: [],
    })),
    sectors: COMPANY_SECTORS.map((sector) => ({ ...sector, aliases: [...sector.aliases] })),
    priorities: COMPANY_PRIORITIES.map((priority) => ({ ...priority, aliases: [...priority.aliases] })),
  };
}

export function validateSiteConfig(value: unknown): SiteConfig {
  if (!isRecord(value)) throw new Error("Configuração inválida.");
  const fallback = getDefaultSiteConfig();
  const contentValue = isRecord(value.content) ? value.content : {};
  const weightValue = isRecord(value.weights) ? value.weights : {};
  const content = {} as SiteContent;

  for (const key of Object.keys(DEFAULT_SITE_CONTENT) as Array<keyof SiteContent>) {
    const candidate = typeof contentValue[key] === "string" ? contentValue[key] : fallback.content[key];
    content[key] = candidate.trim().slice(0, CONTENT_LIMITS[key]);
  }

  const weights: ScoringWeights = {
    skills: cleanWeight(weightValue.skills, fallback.weights.skills),
    experience: cleanWeight(weightValue.experience, fallback.weights.experience),
    vacancy: cleanWeight(weightValue.vacancy, fallback.weights.vacancy),
    company: cleanWeight(weightValue.company, fallback.weights.company),
    softSkills: cleanWeight(weightValue.softSkills, fallback.weights.softSkills),
    education: cleanWeight(weightValue.education, fallback.weights.education),
  };
  const weightTotal = Object.values(weights).reduce((total, weight) => total + weight, 0);
  if (weightTotal !== 100) throw new Error("Os pesos da análise precisam somar 100%.");
  if (weights.skills + weights.experience + weights.softSkills + weights.education === 0) {
    throw new Error("Mantenha algum peso em uma dimensão que sempre participa da análise.");
  }

  const occupations = cleanOccupations(value.occupations, fallback.occupations);
  const sectors = cleanLabeledOptions(value.sectors, fallback.sectors, "setor", 60);
  const priorities = cleanLabeledOptions(value.priorities, fallback.priorities, "prioridade", 40);
  if (!occupations.length) throw new Error("Mantenha ao menos um cargo ativo.");
  if (!sectors.length) throw new Error("Mantenha ao menos um setor ativo.");

  return { content, weights, occupations, sectors, priorities };
}

export function findConfiguredOccupation(config: SiteConfig, value: string): EditableOccupation | null {
  const normalized = normalizeConfigText(value);
  if (!normalized) return null;
  return config.occupations.find((occupation) =>
    occupation.id === value ||
    normalizeConfigText(occupation.title) === normalized ||
    occupation.aliases.some((alias) => normalizeConfigText(alias) === normalized),
  ) ?? null;
}

function cleanOccupations(value: unknown, fallback: EditableOccupation[]): EditableOccupation[] {
  if (!Array.isArray(value)) return fallback;
  if (value.length > 600) throw new Error("O catálogo pode ter no máximo 600 cargos.");
  const usedIds = new Set<string>();
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const title = cleanString(item.title, 120);
    if (!title) return [];
    const area = cleanString(item.area, 80) || "Outras áreas";
    const profileId = cleanString(item.profileId, 80);
    const baseId = cleanId(item.id, `cargo-${index + 1}`);
    const id = uniqueId(baseId, usedIds);
    return [{
      id,
      title,
      area,
      profileId: PROFILE_IDS.has(profileId) ? profileId : "generic",
      aliases: cleanStringList(item.aliases, 10, 100),
      skillKeywords: cleanStringList(item.skillKeywords, 16, 100),
    }];
  });
}

function cleanLabeledOptions<T extends CompanySector | CompanyPriority>(
  value: unknown,
  fallback: T[],
  prefix: string,
  maxItems: number,
): T[] {
  if (!Array.isArray(value)) return fallback;
  if (value.length > maxItems) throw new Error(`A lista pode ter no máximo ${maxItems} itens.`);
  const usedIds = new Set<string>();
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const label = cleanString(item.label, 100);
    if (!label) return [];
    const baseId = cleanId(item.id, `${prefix}-${index + 1}`);
    return [{
      id: uniqueId(baseId, usedIds),
      label,
      aliases: cleanStringList(item.aliases, 16, 100),
    } as T];
  });
}

function cleanStringList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean))].slice(0, maxItems);
}

function cleanWeight(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : fallback;
}

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanId(value: unknown, fallback: string): string {
  const normalized = normalizeConfigText(typeof value === "string" ? value : fallback)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 78);
  return normalized || fallback;
}

function uniqueId(base: string, usedIds: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base.slice(0, 72)}-${suffix++}`;
  usedIds.add(id);
  return id;
}

function normalizeConfigText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\([ao]\)/g, "").replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
