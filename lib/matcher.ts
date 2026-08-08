import {
  getCompanyPriorities,
  getCompanySector,
  type CompanyPriority,
  type CompanySector,
} from "./company-catalog";
import {
  GENERIC_PROFILE,
  ROLE_PROFILES,
  findOccupation,
  getProfileById,
  type RoleProfile,
  type SkillRequirement,
} from "./role-catalog";
import {
  DEFAULT_SCORING_WEIGHTS,
  type ScoringWeights,
} from "./site-config";

export { ROLE_PROFILES } from "./role-catalog";
export type { RoleProfile, SkillRequirement } from "./role-catalog";

export type MatchDimension = {
  id: "skills" | "experience" | "context" | "company" | "softSkills" | "education";
  label: string;
  score: number;
  detail: string;
  weight?: number;
};

export type CompanyMatch = {
  score: number;
  sectorLabel: string;
  detail: string;
  matchedSignals: string[];
  missingSignals: string[];
};

export type MatchResult = {
  analysisVersion?: number;
  score: number;
  level: string;
  summary: string;
  dimensions: MatchDimension[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  keywords: { matched: string[]; missing: string[] };
  signals: { years: number; hasDegree: boolean; hasMetrics: boolean };
  companyMatch?: CompanyMatch;
};

type WeightedDimension = Omit<MatchDimension, "weight"> & { baseWeight: number };

const STOP_WORDS = new Set(
  [
    "para", "com", "uma", "que", "por", "dos", "das", "ser", "ter", "como",
    "mais", "seu", "sua", "nos", "nas", "pela", "pelo", "entre", "sobre",
    "vaga", "empresa", "profissional", "pessoa", "anos", "area", "atividades",
    "responsabilidades", "requisitos", "desejavel", "experiencia", "conhecimento",
    "conhecimentos", "trabalho", "time", "equipe", "cargo", "funcao", "atuacao",
    "buscamos", "procuramos", "sera", "precisa", "possuir", "and", "the", "for",
    "with", "from", "this", "will", "your", "our", "you", "are",
  ].map(normalizeText),
);

export function getRoleProfile(value: string): RoleProfile {
  const occupation = findOccupation(value);
  if (occupation) return getProfileById(occupation.profileId) ?? GENERIC_PROFILE;
  return getProfileById(value) ?? GENERIC_PROFILE;
}

export function analyzeCompatibility(input: {
  resumeText: string;
  roleId: string;
  roleTitle?: string;
  roleProfileId?: string;
  roleSkillKeywords?: string[];
  company: string;
  companySectorId?: string;
  companyPriorityIds?: string[];
  companySector?: CompanySector | null;
  companyPriorities?: CompanyPriority[];
  companyDescription?: string;
  jobDescription?: string;
  weights?: ScoringWeights;
}): MatchResult {
  const resume = normalizeText(input.resumeText);
  const description = normalizeText(input.jobDescription ?? "");
  const occupation = findOccupation(input.roleId) ?? findOccupation(input.roleTitle ?? "");
  const directProfile = getProfileById(input.roleProfileId ?? "") ?? getProfileById(input.roleId);
  const baseProfile = directProfile ?? (occupation
    ? getProfileById(occupation.profileId) ?? GENERIC_PROFILE
    : GENERIC_PROFILE);
  const roleTitle = input.roleTitle?.trim() || occupation?.title || baseProfile.title;
  const isCustomRole = baseProfile.id === GENERIC_PROFILE.id && !occupation && !input.roleProfileId;
  const configuredSkills = (input.roleSkillKeywords ?? [])
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 16)
    .map((keyword) => ({ label: displayKeyword(keyword), aliases: [keyword] }));
  const dynamicSkills = configuredSkills.length
    ? configuredSkills
    : isCustomRole ? buildDynamicSkills(description) : [];
  const profile: RoleProfile = {
    ...baseProfile,
    title: roleTitle,
    minYears: extractRequiredYears(description) || baseProfile.minYears,
    skills: dynamicSkills.length ? dynamicSkills : baseProfile.skills,
  };

  const matchedSkills = profile.skills.filter((item) => matchesRequirement(resume, item));
  const missingSkills = profile.skills.filter((item) => !matchesRequirement(resume, item));
  const matchedSoft = profile.softSkills.filter((item) => matchesRequirement(resume, item));
  const years = extractYears(resume);
  const requiredYears = extractRequiredYears(description) || profile.minYears;
  const degreeRequired = containsAny(description, [
    "graduacao", "ensino superior", "bacharelado", "licenciatura", "tecnologo",
  ]);
  const hasDegree = containsAny(resume, [
    "graduacao", "bacharel", "bacharelado", "licenciatura", "ensino superior",
    "tecnologo", "pos graduacao", "mba", "mestrado", "doutorado",
  ]);
  const hasTechnicalEducation = containsAny(resume, ["curso tecnico", "tecnico em", "formacao tecnica"]);
  const hasMetrics = /(?:\b\d{1,3}%\b|\br\$\s?\d|\b\d+[.,]?\d*\s?(?:mil|milhao|milhão|clientes|projetos|vendas|leads|atendimentos|pedidos)\b)/i.test(input.resumeText);
  const customKeywords = extractKeywords(description);
  const matchedKeywords = customKeywords.filter((word) => includesTerm(resume, word));
  const missingKeywords = customKeywords.filter((word) => !includesTerm(resume, word));
  const skillsScore = percentage(matchedSkills.length, profile.skills.length);
  const experienceScore = requiredYears <= 0
    ? 78
    : years === 0
      ? 42
      : clamp(Math.round((years / requiredYears) * 86 + 14), 40, 100);
  const vacancyScore = customKeywords.length
    ? percentage(matchedKeywords.length, customKeywords.length)
    : null;
  const softScore = percentage(matchedSoft.length, profile.softSkills.length);
  const educationScore = degreeRequired
    ? hasDegree ? 100 : hasTechnicalEducation ? 68 : 35
    : hasDegree ? 100 : hasTechnicalEducation ? 82 : 62;
  const companyMatch = analyzeCompanyContext({
    resume,
    sector: input.companySector === undefined
      ? getCompanySector(input.companySectorId ?? "")
      : input.companySector,
    priorities: input.companyPriorities ?? getCompanyPriorities(input.companyPriorityIds ?? []),
    companyDescription: input.companyDescription ?? "",
  });
  const weights = input.weights ?? DEFAULT_SCORING_WEIGHTS;

  const weightedDimensions: WeightedDimension[] = [
    {
      id: "skills",
      label: "Competências técnicas",
      score: skillsScore,
      baseWeight: weights.skills,
      detail: (isCustomRole || configuredSkills.length > 0) && dynamicSkills.length > 0
        ? `${matchedSkills.length} de ${profile.skills.length} requisitos extraídos do anúncio encontrados`
        : `${matchedSkills.length} de ${profile.skills.length} competências essenciais encontradas`,
    },
    {
      id: "experience",
      label: "Experiência",
      score: experienceScore,
      baseWeight: weights.experience,
      detail: years
        ? `${years} ano${years === 1 ? "" : "s"} de experiência sinalizado${years === 1 ? "" : "s"}`
        : "Tempo de experiência não identificado com clareza",
    },
  ];

  if (vacancyScore !== null) {
    weightedDimensions.push({
      id: "context",
      label: "Aderência à vaga",
      score: vacancyScore,
      baseWeight: weights.vacancy,
      detail: `${matchedKeywords.length} de ${customKeywords.length} termos específicos do anúncio encontrados`,
    });
  }

  if (companyMatch) {
    weightedDimensions.push({
      id: "company",
      label: "Contexto da empresa",
      score: companyMatch.score,
      baseWeight: weights.company,
      detail: companyMatch.detail,
    });
  }

  weightedDimensions.push(
    {
      id: "softSkills",
      label: "Competências comportamentais",
      score: softScore,
      baseWeight: weights.softSkills,
      detail: `${matchedSoft.length} de ${profile.softSkills.length} sinais comportamentais encontrados`,
    },
    {
      id: "education",
      label: "Formação",
      score: educationScore,
      baseWeight: weights.education,
      detail: hasDegree
        ? "Formação superior identificada"
        : hasTechnicalEducation
          ? "Formação técnica identificada"
          : degreeRequired
            ? "A formação solicitada não ficou clara no currículo"
            : "O anúncio não exige formação específica e o currículo não a destaca",
    },
  );

  let scoringDimensions = weightedDimensions;
  let totalWeight = scoringDimensions.reduce((total, dimension) => total + dimension.baseWeight, 0);
  if (totalWeight <= 0) {
    scoringDimensions = weightedDimensions.map((dimension) => ({
      ...dimension,
      baseWeight: defaultWeightForDimension(dimension.id),
    }));
    totalWeight = scoringDimensions.reduce((total, dimension) => total + dimension.baseWeight, 0);
  }
  let score = Math.round(scoringDimensions.reduce(
    (total, dimension) => total + dimension.score * dimension.baseWeight,
    0,
  ) / totalWeight);
  if (resume.length < 450) score -= 7;
  if (hasMetrics) score += 3;
  score = clamp(score, 18, 97);

  const dimensions: MatchDimension[] = scoringDimensions.map(({ baseWeight, ...dimension }) => ({
    ...dimension,
    weight: Math.round((baseWeight / totalWeight) * 100),
  }));
  const level = score >= 85
    ? "Compatibilidade excelente"
    : score >= 70
      ? "Boa compatibilidade"
      : score >= 55
        ? "Compatibilidade moderada"
        : "Compatibilidade em desenvolvimento";
  const strengths = buildStrengths({
    matchedSkills,
    years,
    requiredYears,
    hasMetrics,
    matchedKeywords,
    companyMatch,
  });
  const gaps = buildGaps({
    missingSkills,
    years,
    requiredYears,
    hasMetrics,
    missingKeywords,
    companyMatch,
  });
  const recommendations = buildRecommendations({
    roleTitle,
    missingSkills,
    hasMetrics,
    inputCompany: input.company,
    hasCustomDescription: customKeywords.length > 0,
    companyMatch,
  });

  return {
    analysisVersion: 2,
    score,
    level,
    summary: buildSummary(score, roleTitle, input.company, companyMatch),
    dimensions,
    matchedSkills: matchedSkills.map((item) => item.label),
    missingSkills: missingSkills.map((item) => item.label),
    strengths,
    gaps,
    recommendations,
    keywords: { matched: matchedKeywords.slice(0, 8), missing: missingKeywords.slice(0, 8) },
    signals: { years, hasDegree, hasMetrics },
    companyMatch: companyMatch ?? undefined,
  };
}

function analyzeCompanyContext(input: {
  resume: string;
  sector: CompanySector | null;
  priorities: CompanyPriority[];
  companyDescription: string;
}): CompanyMatch | null {
  const sector = input.sector;
  const priorities = input.priorities;
  const companyText = normalizeText(input.companyDescription);
  const companyKeywords = extractKeywords(companyText, 10);
  const components: Array<{ score: number; weight: number }> = [];
  const matchedSignals: string[] = [];
  const missingSignals: string[] = [];
  let sectorHits = 0;

  if (sector?.aliases.length) {
    const matchedSectorTerms = sector.aliases.filter((alias) => includesTerm(input.resume, alias));
    sectorHits = matchedSectorTerms.length;
    components.push({
      score: sectorHits ? clamp(62 + (sectorHits - 1) * 14, 62, 100) : 34,
      weight: 45,
    });
    if (sectorHits) matchedSignals.push(`Vivência em ${sector.label}`);
    else missingSignals.push(`Experiência no setor: ${sector.label}`);
  }

  if (priorities.length) {
    const matchedPriorities = priorities.filter((priority) =>
      priority.aliases.some((alias) => includesTerm(input.resume, alias)),
    );
    const missingPriorities = priorities.filter((priority) => !matchedPriorities.includes(priority));
    components.push({ score: percentage(matchedPriorities.length, priorities.length), weight: 35 });
    matchedSignals.push(...matchedPriorities.map((priority) => priority.label));
    missingSignals.push(...missingPriorities.map((priority) => priority.label));
  }

  if (companyKeywords.length) {
    const matchedCompanyKeywords = companyKeywords.filter((keyword) => includesTerm(input.resume, keyword));
    const missingCompanyKeywords = companyKeywords.filter((keyword) => !includesTerm(input.resume, keyword));
    components.push({ score: percentage(matchedCompanyKeywords.length, companyKeywords.length), weight: 20 });
    matchedSignals.push(...matchedCompanyKeywords.slice(0, 4).map((keyword) => `Contexto: ${displayKeyword(keyword)}`));
    missingSignals.push(...missingCompanyKeywords.slice(0, 3).map((keyword) => displayKeyword(keyword)));
  }

  if (!components.length) return null;
  const totalWeight = components.reduce((total, component) => total + component.weight, 0);
  const score = clamp(Math.round(components.reduce(
    (total, component) => total + component.score * component.weight,
    0,
  ) / totalWeight), 0, 100);
  const sources = [
    sector?.aliases.length ? `${sectorHits} sinal${sectorHits === 1 ? "" : "is"} do setor` : "",
    priorities.length ? `${priorities.length} prioridade${priorities.length === 1 ? "" : "s"}` : "",
    companyKeywords.length ? `${companyKeywords.length} termo${companyKeywords.length === 1 ? "" : "s"} do texto da empresa` : "",
  ].filter(Boolean);

  return {
    score,
    sectorLabel: sector?.label ?? "Contexto informado",
    detail: `A comparação considerou ${joinNatural(sources)}. O nome da empresa não altera a nota sozinho.`,
    matchedSignals: unique(matchedSignals).slice(0, 8),
    missingSignals: unique(missingSignals).slice(0, 8),
  };
}

function buildDynamicSkills(description: string): SkillRequirement[] {
  if (!description) return [];
  const known = uniqueRequirements(
    ROLE_PROFILES.flatMap((profile) => profile.skills)
      .filter((requirement) => matchesRequirement(description, requirement)),
  ).slice(0, 9);
  if (known.length >= 4) return known;

  const extracted = extractKeywords(description, 10)
    .map((keyword) => ({ label: displayKeyword(keyword), aliases: [keyword] }));
  return uniqueRequirements([...known, ...extracted]).slice(0, 8);
}

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function includesTerm(text: string, term: string): boolean {
  const normalized = normalizeText(term);
  if (!normalized) return false;
  return ` ${text} `.includes(` ${normalized} `);
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => includesTerm(text, term));
}

function matchesRequirement(text: string, requirement: SkillRequirement): boolean {
  return requirement.aliases.some((alias) => includesTerm(text, alias));
}

function extractYears(text: string): number {
  const plausible = [...text.matchAll(/\b(\d{1,2})\s*(?:anos?|years?)\b/g)]
    .map((match) => Number(match[1])).filter((value) => value > 0 && value < 45);
  return plausible.length ? Math.max(...plausible) : 0;
}

function extractRequiredYears(text: string): number {
  const plausible = [...text.matchAll(/\b(\d{1,2})\s*(?:anos?|years?)\b/g)]
    .map((match) => Number(match[1])).filter((value) => value > 0 && value < 20);
  return plausible.length ? Math.min(...plausible) : 0;
}

function extractKeywords(text: string, limit = 12): string[] {
  if (!text) return [];
  const counts = new Map<string, number>();
  for (const token of text.split(" ")) {
    if (token.length < 4 || STOP_WORDS.has(token) || /^\d+$/.test(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([token]) => token);
}

function buildStrengths(input: {
  matchedSkills: SkillRequirement[];
  years: number;
  requiredYears: number;
  hasMetrics: boolean;
  matchedKeywords: string[];
  companyMatch: CompanyMatch | null;
}): string[] {
  const strengths: string[] = [];
  if (input.matchedSkills.length) strengths.push(`Boa presença de ${input.matchedSkills.slice(0, 3).map((item) => item.label).join(", ")}.`);
  if (input.years >= input.requiredYears && input.years > 0) strengths.push("O tempo de experiência indicado atende ao patamar esperado para a função.");
  if (input.hasMetrics) strengths.push("O currículo usa números e resultados, o que fortalece a credibilidade das entregas.");
  if (input.matchedKeywords.length >= 4) strengths.push("A linguagem do currículo está bem alinhada aos termos específicos do anúncio.");
  if (input.companyMatch && input.companyMatch.score >= 70) strengths.push("Há evidências profissionais alinhadas ao setor e às prioridades informadas da empresa.");
  if (!strengths.length) strengths.push("Há uma base profissional aproveitável, mas ela precisa ficar mais explícita no currículo.");
  return strengths.slice(0, 4);
}

function buildGaps(input: {
  missingSkills: SkillRequirement[];
  years: number;
  requiredYears: number;
  hasMetrics: boolean;
  missingKeywords: string[];
  companyMatch: CompanyMatch | null;
}): string[] {
  const gaps: string[] = [];
  if (input.missingSkills.length) gaps.push(`Não encontramos evidência clara de ${input.missingSkills.slice(0, 3).map((item) => item.label).join(", ")}.`);
  if (input.years < input.requiredYears) gaps.push(input.years
    ? `O currículo sinaliza ${input.years} ano${input.years === 1 ? "" : "s"}; a referência da vaga é ${input.requiredYears}.`
    : "O tempo de experiência não está descrito de forma fácil de identificar.");
  if (!input.hasMetrics) gaps.push("Faltam resultados mensuráveis, como percentuais, volume, receita, prazo ou economia gerada.");
  if (input.missingKeywords.length >= 4) gaps.push(`Alguns termos relevantes do anúncio não aparecem: ${input.missingKeywords.slice(0, 4).join(", ")}.`);
  if (input.companyMatch && input.companyMatch.score < 55) gaps.push("O currículo ainda mostra pouca evidência do setor ou das prioridades profissionais informadas para a empresa.");
  return gaps.slice(0, 4);
}

function buildRecommendations(input: {
  roleTitle: string;
  missingSkills: SkillRequirement[];
  hasMetrics: boolean;
  inputCompany: string;
  hasCustomDescription: boolean;
  companyMatch: CompanyMatch | null;
}): string[] {
  const recommendations: string[] = [];
  if (input.missingSkills.length) recommendations.push(`Se você já usou ${input.missingSkills.slice(0, 2).map((item) => item.label).join(" ou ")}, cite onde e qual resultado obteve.`);
  if (!input.hasMetrics) recommendations.push("Reescreva ao menos duas experiências no formato: ação + contexto + resultado em números.");
  if (input.companyMatch?.missingSignals.length) recommendations.push(`Se forem experiências reais, deixe mais visível sua conexão com ${input.companyMatch.missingSignals.slice(0, 2).join(" e ")}.`);
  recommendations.push(`Abra o currículo com um resumo de 3 linhas direcionado a ${input.roleTitle}${input.inputCompany ? ` na ${input.inputCompany}` : ""}.`);
  recommendations.push(input.hasCustomDescription
    ? "Repita naturalmente os termos do anúncio que representam experiências reais suas; isso melhora a leitura por ATS."
    : "Cole a descrição completa da vaga em uma próxima análise para obter uma comparação ainda mais específica.");
  return recommendations.slice(0, 4);
}

function buildSummary(score: number, role: string, company: string, companyMatch: CompanyMatch | null): string {
  const destination = `${role}${company ? ` na ${company}` : ""}`;
  const companyNote = companyMatch
    ? ` O contexto profissional da empresa marcou ${companyMatch.score}%.`
    : "";
  if (score >= 85) return `Seu currículo conversa muito bem com a posição de ${destination}. Os principais critérios já aparecem com clareza.${companyNote}`;
  if (score >= 70) return `Seu currículo tem uma base competitiva para ${destination}. Alguns ajustes de linguagem e evidência podem elevar a aderência.${companyNote}`;
  if (score >= 55) return `Há pontos compatíveis com ${destination}, mas competências importantes ainda não estão demonstradas de forma clara.${companyNote}`;
  return `A conexão com ${destination} ainda está baixa no texto atual. O relatório mostra o que tornar mais visível antes de se candidatar.${companyNote}`;
}

function displayKeyword(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function joinNatural(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "o contexto informado";
  return `${values.slice(0, -1).join(", ")} e ${values.at(-1)}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function uniqueRequirements(values: SkillRequirement[]): SkillRequirement[] {
  const seen = new Set<string>();
  return values.filter((requirement) => {
    const key = normalizeText(requirement.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function percentage(found: number, total: number): number {
  return total ? clamp(Math.round((found / total) * 100), 0, 100) : 0;
}

function defaultWeightForDimension(id: MatchDimension["id"]): number {
  if (id === "context") return DEFAULT_SCORING_WEIGHTS.vacancy;
  return DEFAULT_SCORING_WEIGHTS[id];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
