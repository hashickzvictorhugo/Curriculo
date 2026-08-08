export type SkillRequirement = {
  label: string;
  aliases: string[];
};

export type RoleProfile = {
  id: string;
  title: string;
  area: string;
  minYears: number;
  skills: SkillRequirement[];
  softSkills: SkillRequirement[];
};

export type MatchDimension = {
  id: "skills" | "experience" | "context" | "softSkills" | "education";
  label: string;
  score: number;
  detail: string;
};

export type MatchResult = {
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
};

const skill = (label: string, ...aliases: string[]): SkillRequirement => ({
  label,
  aliases: [label, ...aliases],
});

const COMMUNICATION = skill(
  "Comunicação",
  "comunicacao",
  "apresentacao",
  "oratória",
  "oratoria",
);
const COLLABORATION = skill(
  "Trabalho em equipe",
  "equipe",
  "colaboracao",
  "colaboração",
  "cross-functional",
);
const ORGANIZATION = skill(
  "Organização",
  "organizacao",
  "planejamento",
  "priorizacao",
  "priorização",
);
const PROBLEM_SOLVING = skill(
  "Resolução de problemas",
  "resolucao de problemas",
  "problem solving",
  "pensamento analitico",
  "pensamento analítico",
);

export const ROLE_PROFILES: RoleProfile[] = [
  {
    id: "software",
    title: "Desenvolvedor(a) de Software",
    area: "Tecnologia",
    minYears: 2,
    skills: [
      skill("JavaScript / TypeScript", "javascript", "typescript"),
      skill("React", "react.js", "next.js", "nextjs"),
      skill("Node.js", "nodejs", "node"),
      skill("APIs REST", "api rest", "restful", "api"),
      skill("Git", "github", "gitlab", "controle de versao"),
      skill("SQL", "postgresql", "mysql", "banco de dados"),
      skill("Testes", "jest", "vitest", "unit tests", "qa"),
      skill("Cloud", "aws", "azure", "gcp", "cloudflare"),
    ],
    softSkills: [PROBLEM_SOLVING, COLLABORATION, COMMUNICATION, ORGANIZATION],
  },
  {
    id: "data",
    title: "Analista de Dados",
    area: "Dados",
    minYears: 2,
    skills: [
      skill("SQL", "postgresql", "mysql", "bigquery"),
      skill("Excel", "planilhas", "tabela dinamica", "tabela dinâmica"),
      skill("Power BI / Tableau", "power bi", "powerbi", "tableau", "looker"),
      skill("Python", "pandas", "numpy", "jupyter"),
      skill("Dashboards", "dashboard", "visualizacao de dados", "visualização de dados"),
      skill("Estatística", "estatistica", "analise estatistica", "análise estatística"),
      skill("KPIs", "indicadores", "metricas", "métricas"),
      skill("ETL", "pipeline de dados", "data pipeline", "dbt"),
    ],
    softSkills: [PROBLEM_SOLVING, COMMUNICATION, ORGANIZATION, COLLABORATION],
  },
  {
    id: "product",
    title: "Product Manager",
    area: "Produto",
    minYears: 3,
    skills: [
      skill("Roadmap", "roadmapping", "visao de produto", "visão de produto"),
      skill("Discovery", "product discovery", "descoberta"),
      skill("Métricas de produto", "metricas de produto", "north star", "kpi"),
      skill("Métodos ágeis", "agile", "scrum", "kanban"),
      skill("Pesquisa com usuários", "user research", "entrevista com usuario", "entrevista com usuário"),
      skill("Priorização", "priorizacao", "rice", "moscow"),
      skill("Backlog", "user stories", "historia de usuario", "história de usuário"),
      skill("Stakeholders", "gestao de stakeholders", "gestão de stakeholders"),
    ],
    softSkills: [COMMUNICATION, ORGANIZATION, COLLABORATION, PROBLEM_SOLVING],
  },
  {
    id: "marketing",
    title: "Analista de Marketing",
    area: "Marketing",
    minYears: 2,
    skills: [
      skill("Mídia paga", "google ads", "meta ads", "trafego pago", "tráfego pago"),
      skill("SEO", "search engine optimization", "sem"),
      skill("Google Analytics", "ga4", "analytics"),
      skill("Copywriting", "copy", "redacao", "redação"),
      skill("CRM", "hubspot", "salesforce", "rd station"),
      skill("Funil de conversão", "funil", "conversao", "conversão"),
      skill("Campanhas", "campanha", "planejamento de campanha"),
      skill("Automação de marketing", "automacao de marketing", "mailchimp", "email marketing"),
    ],
    softSkills: [COMMUNICATION, ORGANIZATION, PROBLEM_SOLVING, COLLABORATION],
  },
  {
    id: "sales",
    title: "Executivo(a) de Vendas / SDR",
    area: "Comercial",
    minYears: 1,
    skills: [
      skill("Prospecção", "prospeccao", "outbound", "cold call", "social selling"),
      skill("CRM", "salesforce", "hubspot", "pipedrive"),
      skill("Negociação", "negociacao", "fechamento", "closing"),
      skill("Pipeline", "funil de vendas", "forecast"),
      skill("Metas", "quota", "target", "resultado comercial"),
      skill("Qualificação de leads", "qualificacao de leads", "spin selling", "bant"),
      skill("Apresentação comercial", "apresentacao comercial", "pitch", "demo"),
      skill("Inside sales", "vendas b2b", "vendas b2c"),
    ],
    softSkills: [COMMUNICATION, ORGANIZATION, PROBLEM_SOLVING, COLLABORATION],
  },
  {
    id: "administrative",
    title: "Assistente Administrativo(a)",
    area: "Administrativo",
    minYears: 1,
    skills: [
      skill("Pacote Office", "microsoft office", "word", "powerpoint"),
      skill("Excel", "planilhas", "tabela dinamica", "tabela dinâmica"),
      skill("Atendimento", "atendimento ao cliente", "recepcao", "recepção"),
      skill("Rotinas administrativas", "processos administrativos", "backoffice"),
      skill("Documentos", "arquivo", "gestao documental", "gestão documental"),
      skill("ERP", "sap", "totvs", "sistema de gestao", "sistema de gestão"),
      skill("Contas a pagar e receber", "financeiro", "faturamento"),
      skill("Agenda e reuniões", "agenda", "reunioes", "reuniões"),
    ],
    softSkills: [ORGANIZATION, COMMUNICATION, COLLABORATION, PROBLEM_SOLVING],
  },
  {
    id: "finance",
    title: "Analista Financeiro(a)",
    area: "Finanças",
    minYears: 2,
    skills: [
      skill("Excel avançado", "excel", "vba", "tabela dinamica", "tabela dinâmica"),
      skill("Fluxo de caixa", "cash flow", "tesouraria"),
      skill("Orçamento", "orcamento", "budget", "forecast"),
      skill("Demonstrações financeiras", "demonstracoes financeiras", "dre", "balanco", "balanço"),
      skill("Modelagem financeira", "financial modeling", "valuation"),
      skill("ERP", "sap", "totvs", "oracle"),
      skill("Power BI", "powerbi", "dashboard"),
      skill("Conciliação", "conciliacao", "contabilidade", "fechamento contabil"),
    ],
    softSkills: [PROBLEM_SOLVING, ORGANIZATION, COMMUNICATION, COLLABORATION],
  },
  {
    id: "hr",
    title: "Analista de RH / Recrutador(a)",
    area: "Pessoas",
    minYears: 2,
    skills: [
      skill("Recrutamento e seleção", "recrutamento", "selecao", "seleção", "r&s"),
      skill("Entrevistas", "entrevista por competencia", "entrevista por competência"),
      skill("ATS", "gupy", "greenhouse", "lever"),
      skill("LinkedIn Recruiter", "linkedin", "hunting"),
      skill("People Analytics", "indicadores de rh", "metricas de rh", "métricas de rh"),
      skill("Onboarding", "integracao", "integração"),
      skill("Treinamento e desenvolvimento", "t&d", "desenvolvimento humano"),
      skill("Legislação trabalhista", "legislacao trabalhista", "clt", "departamento pessoal"),
    ],
    softSkills: [COMMUNICATION, ORGANIZATION, COLLABORATION, PROBLEM_SOLVING],
  },
  {
    id: "customer-success",
    title: "Customer Success",
    area: "Relacionamento",
    minYears: 2,
    skills: [
      skill("Onboarding de clientes", "onboarding", "implantacao", "implantação"),
      skill("Retenção", "retencao", "churn", "renovacao", "renovação"),
      skill("CRM", "salesforce", "hubspot", "gainsight"),
      skill("NPS / CSAT", "nps", "csat", "satisfacao", "satisfação"),
      skill("Gestão de carteira", "gestao de carteira", "account management"),
      skill("SaaS", "software as a service", "b2b"),
      skill("Expansão", "expansao", "upsell", "cross-sell"),
      skill("Sucesso do cliente", "customer experience", "experiencia do cliente"),
    ],
    softSkills: [COMMUNICATION, PROBLEM_SOLVING, ORGANIZATION, COLLABORATION],
  },
  {
    id: "design",
    title: "UX/UI Designer",
    area: "Design",
    minYears: 2,
    skills: [
      skill("Figma"),
      skill("Pesquisa com usuários", "user research", "entrevista", "teste com usuario"),
      skill("Prototipação", "prototipacao", "prototype", "prototipo", "protótipo"),
      skill("Design System", "sistema de design", "componentes"),
      skill("Usabilidade", "teste de usabilidade", "heuristicas", "heurísticas"),
      skill("Wireframes", "wireframe", "fluxo de usuario", "fluxo de usuário"),
      skill("UI Design", "interface", "visual design"),
      skill("Acessibilidade", "wcag", "design inclusivo"),
    ],
    softSkills: [COLLABORATION, COMMUNICATION, PROBLEM_SOLVING, ORGANIZATION],
  },
  {
    id: "logistics",
    title: "Analista de Logística",
    area: "Operações",
    minYears: 2,
    skills: [
      skill("Controle de estoque", "estoque", "inventario", "inventário"),
      skill("Supply Chain", "cadeia de suprimentos", "suprimentos"),
      skill("ERP / SAP", "erp", "sap", "totvs"),
      skill("Excel", "planilhas", "tabela dinamica", "tabela dinâmica"),
      skill("Transportes", "frete", "roteirizacao", "roteirização"),
      skill("Indicadores logísticos", "indicadores logisticos", "kpi", "sla"),
      skill("WMS", "tms", "sistema de armazenagem"),
      skill("Planejamento de demanda", "forecast", "s&op", "demanda"),
    ],
    softSkills: [ORGANIZATION, PROBLEM_SOLVING, COMMUNICATION, COLLABORATION],
  },
  {
    id: "projects",
    title: "Gerente de Projetos",
    area: "Gestão",
    minYears: 3,
    skills: [
      skill("Planejamento de projetos", "project planning", "cronograma"),
      skill("Gestão de riscos", "gestao de riscos", "riscos"),
      skill("Métodos ágeis", "agile", "scrum", "kanban"),
      skill("Orçamento", "orcamento", "budget", "custos"),
      skill("Stakeholders", "gestao de stakeholders", "gestão de stakeholders"),
      skill("Jira / Trello", "jira", "trello", "asana", "monday"),
      skill("PMBOK", "pmp", "prince2"),
      skill("Indicadores de projeto", "kpi", "status report", "slo"),
    ],
    softSkills: [ORGANIZATION, COMMUNICATION, COLLABORATION, PROBLEM_SOLVING],
  },
];

const STOP_WORDS = new Set(
  [
    "para", "com", "uma", "que", "por", "dos", "das", "ser", "ter", "como",
    "mais", "seu", "sua", "nos", "nas", "pela", "pelo", "entre", "sobre",
    "vaga", "empresa", "profissional", "pessoa", "anos", "area", "atividades",
    "responsabilidades", "requisitos", "desejavel", "experiencia", "conhecimento",
    "conhecimentos", "trabalho", "time", "equipe", "and", "the", "for", "with",
    "from", "this", "will", "your", "our",
  ].map(normalizeText),
);

export function getRoleProfile(roleId: string): RoleProfile {
  return ROLE_PROFILES.find((role) => role.id === roleId) ?? ROLE_PROFILES[0];
}

export function analyzeCompatibility(input: {
  resumeText: string;
  roleId: string;
  company: string;
  jobDescription?: string;
}): MatchResult {
  const profile = getRoleProfile(input.roleId);
  const resume = normalizeText(input.resumeText);
  const description = normalizeText(input.jobDescription ?? "");
  const matchedSkills = profile.skills.filter((item) => matchesRequirement(resume, item));
  const missingSkills = profile.skills.filter((item) => !matchesRequirement(resume, item));
  const matchedSoft = profile.softSkills.filter((item) => matchesRequirement(resume, item));
  const years = extractYears(resume);
  const requiredYears = description ? extractRequiredYears(description) || profile.minYears : profile.minYears;
  const hasDegree = containsAny(resume, [
    "graduacao", "bacharel", "bacharelado", "licenciatura", "ensino superior",
    "tecnologo", "pos graduacao", "mba", "mestrado",
  ]);
  const hasTechnicalEducation = containsAny(resume, ["curso tecnico", "tecnico em"]);
  const hasMetrics = /(?:\b\d{1,3}%\b|\br\$\s?\d|\b\d+[.,]?\d*\s?(?:mil|milhao|milhão|clientes|projetos|vendas|leads)\b)/i.test(input.resumeText);
  const customKeywords = extractKeywords(description);
  const matchedKeywords = customKeywords.filter((word) => includesTerm(resume, word));
  const missingKeywords = customKeywords.filter((word) => !includesTerm(resume, word));
  const skillsScore = percentage(matchedSkills.length, profile.skills.length);
  const experienceScore = requiredYears <= 0
    ? 78
    : years === 0
      ? 42
      : clamp(Math.round((years / requiredYears) * 86 + 14), 40, 100);
  const contextScore = customKeywords.length
    ? percentage(matchedKeywords.length, customKeywords.length)
    : clamp(Math.round(skillsScore * 0.72 + (hasMetrics ? 22 : 8)), 20, 100);
  const softScore = percentage(matchedSoft.length, profile.softSkills.length);
  const educationScore = hasDegree ? 100 : hasTechnicalEducation ? 76 : 48;

  let score = Math.round(
    skillsScore * 0.45 + experienceScore * 0.22 + contextScore * 0.15 +
    softScore * 0.1 + educationScore * 0.08,
  );
  if (resume.length < 450) score -= 7;
  if (hasMetrics) score += 3;
  score = clamp(score, 18, 97);

  const level = score >= 85
    ? "Compatibilidade excelente"
    : score >= 70
      ? "Boa compatibilidade"
      : score >= 55
        ? "Compatibilidade moderada"
        : "Compatibilidade em desenvolvimento";
  const strengths = buildStrengths({ matchedSkills, years, requiredYears, hasMetrics, matchedKeywords });
  const gaps = buildGaps({ missingSkills, years, requiredYears, hasMetrics, missingKeywords });
  const recommendations = buildRecommendations({
    profile,
    missingSkills,
    hasMetrics,
    inputCompany: input.company,
    hasCustomDescription: customKeywords.length > 0,
  });

  return {
    score,
    level,
    summary: buildSummary(score, profile.title, input.company),
    dimensions: [
      {
        id: "skills",
        label: "Competências técnicas",
        score: skillsScore,
        detail: `${matchedSkills.length} de ${profile.skills.length} competências essenciais encontradas`,
      },
      {
        id: "experience",
        label: "Experiência",
        score: experienceScore,
        detail: years
          ? `${years} ano${years === 1 ? "" : "s"} de experiência sinalizado${years === 1 ? "" : "s"}`
          : "Tempo de experiência não identificado com clareza",
      },
      {
        id: "context",
        label: "Aderência à vaga",
        score: contextScore,
        detail: customKeywords.length
          ? `${matchedKeywords.length} de ${customKeywords.length} termos específicos encontrados`
          : "Comparação feita com o perfil padrão da profissão",
      },
      {
        id: "softSkills",
        label: "Competências comportamentais",
        score: softScore,
        detail: `${matchedSoft.length} de ${profile.softSkills.length} sinais comportamentais encontrados`,
      },
      {
        id: "education",
        label: "Formação",
        score: educationScore,
        detail: hasDegree
          ? "Formação superior identificada"
          : hasTechnicalEducation
            ? "Formação técnica identificada"
            : "Formação não identificada com clareza",
      },
    ],
    matchedSkills: matchedSkills.map((item) => item.label),
    missingSkills: missingSkills.map((item) => item.label),
    strengths,
    gaps,
    recommendations,
    keywords: { matched: matchedKeywords.slice(0, 8), missing: missingKeywords.slice(0, 8) },
    signals: { years, hasDegree, hasMetrics },
  };
}

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function includesTerm(text: string, term: string): boolean {
  const normalized = normalizeText(term);
  if (!normalized) return false;
  return ` ${text} `.includes(` ${normalized} `) || text.includes(normalized);
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

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const counts = new Map<string, number>();
  for (const token of text.split(" ")) {
    if (token.length < 4 || STOP_WORDS.has(token) || /^\d+$/.test(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 12).map(([token]) => token);
}

function buildStrengths(input: {
  matchedSkills: SkillRequirement[]; years: number; requiredYears: number;
  hasMetrics: boolean; matchedKeywords: string[];
}): string[] {
  const strengths: string[] = [];
  if (input.matchedSkills.length) strengths.push(`Boa presença de ${input.matchedSkills.slice(0, 3).map((item) => item.label).join(", ")}.`);
  if (input.years >= input.requiredYears && input.years > 0) strengths.push("O tempo de experiência indicado atende ao patamar esperado para a função.");
  if (input.hasMetrics) strengths.push("O currículo usa números e resultados, o que fortalece a credibilidade das entregas.");
  if (input.matchedKeywords.length >= 4) strengths.push("A linguagem do currículo está bem alinhada aos termos específicos do anúncio.");
  if (!strengths.length) strengths.push("Há uma base profissional aproveitável, mas ela precisa ficar mais explícita no currículo.");
  return strengths.slice(0, 4);
}

function buildGaps(input: {
  missingSkills: SkillRequirement[]; years: number; requiredYears: number;
  hasMetrics: boolean; missingKeywords: string[];
}): string[] {
  const gaps: string[] = [];
  if (input.missingSkills.length) gaps.push(`Não encontramos evidência clara de ${input.missingSkills.slice(0, 3).map((item) => item.label).join(", ")}.`);
  if (input.years < input.requiredYears) gaps.push(input.years
    ? `O currículo sinaliza ${input.years} ano${input.years === 1 ? "" : "s"}; a referência da vaga é ${input.requiredYears}.`
    : "O tempo de experiência não está descrito de forma fácil de identificar.");
  if (!input.hasMetrics) gaps.push("Faltam resultados mensuráveis, como percentuais, volume, receita, prazo ou economia gerada.");
  if (input.missingKeywords.length >= 4) gaps.push(`Alguns termos relevantes do anúncio não aparecem: ${input.missingKeywords.slice(0, 4).join(", ")}.`);
  return gaps.slice(0, 4);
}

function buildRecommendations(input: {
  profile: RoleProfile; missingSkills: SkillRequirement[]; hasMetrics: boolean;
  inputCompany: string; hasCustomDescription: boolean;
}): string[] {
  const recommendations: string[] = [];
  if (input.missingSkills.length) recommendations.push(`Se você já usou ${input.missingSkills.slice(0, 2).map((item) => item.label).join(" ou ")}, cite onde e qual resultado obteve.`);
  if (!input.hasMetrics) recommendations.push("Reescreva ao menos duas experiências no formato: ação + contexto + resultado em números.");
  recommendations.push(`Abra o currículo com um resumo de 3 linhas direcionado a ${input.profile.title}${input.inputCompany ? ` na ${input.inputCompany}` : ""}.`);
  recommendations.push(input.hasCustomDescription
    ? "Repita naturalmente os termos do anúncio que representam experiências reais suas; isso melhora a leitura por ATS."
    : "Cole a descrição completa da vaga em uma próxima análise para obter uma comparação ainda mais específica.");
  return recommendations.slice(0, 4);
}

function buildSummary(score: number, role: string, company: string): string {
  const destination = `${role}${company ? ` na ${company}` : ""}`;
  if (score >= 85) return `Seu currículo conversa muito bem com a posição de ${destination}. Os principais critérios já aparecem com clareza.`;
  if (score >= 70) return `Seu currículo tem uma base competitiva para ${destination}. Alguns ajustes de linguagem e evidência podem elevar a aderência.`;
  if (score >= 55) return `Há pontos compatíveis com ${destination}, mas competências importantes ainda não estão demonstradas de forma clara.`;
  return `A conexão com ${destination} ainda está baixa no texto atual. O relatório mostra o que tornar mais visível antes de se candidatar.`;
}

function percentage(found: number, total: number): number {
  return total ? clamp(Math.round((found / total) * 100), 0, 100) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
