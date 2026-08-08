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

export type OccupationOption = {
  id: string;
  title: string;
  area: string;
  profileId: string;
  aliases: string[];
};

const skill = (label: string, ...aliases: string[]): SkillRequirement => ({
  label,
  aliases: [label, ...aliases],
});

const COMMUNICATION = skill("Comunicação", "comunicacao", "apresentacao", "oratória", "oratoria");
const COLLABORATION = skill("Trabalho em equipe", "equipe", "colaboracao", "cooperação", "cooperacao");
const ORGANIZATION = skill("Organização", "organizacao", "planejamento", "priorizacao", "priorização");
const PROBLEM_SOLVING = skill("Resolução de problemas", "resolucao de problemas", "problem solving", "pensamento analítico", "pensamento analitico");
const LEADERSHIP = skill("Liderança", "lideranca", "gestao de pessoas", "coordenação", "coordenacao");
const CUSTOMER_FOCUS = skill("Foco no cliente", "cliente", "atendimento", "experiência do cliente", "experiencia do cliente");

const DEFAULT_SOFT_SKILLS = [COMMUNICATION, COLLABORATION, ORGANIZATION, PROBLEM_SOLVING];

const profile = (
  id: string,
  title: string,
  area: string,
  minYears: number,
  skills: SkillRequirement[],
  softSkills: SkillRequirement[] = DEFAULT_SOFT_SKILLS,
): RoleProfile => ({ id, title, area, minYears, skills, softSkills });

export const GENERIC_PROFILE = profile(
  "generic",
  "Profissão personalizada",
  "Outras áreas",
  1,
  [
    skill("Processos da função", "processos", "rotinas", "procedimentos"),
    skill("Ferramentas da área", "ferramentas", "sistemas", "equipamentos"),
    skill("Atendimento a requisitos", "requisitos", "normas", "padroes", "padrões"),
    skill("Indicadores e resultados", "indicadores", "resultados", "metas", "kpi"),
    COMMUNICATION,
    ORGANIZATION,
  ],
);

export const ROLE_PROFILES: RoleProfile[] = [
  profile("software", "Desenvolvimento de Software", "Tecnologia", 2, [
    skill("Lógica de programação", "programacao", "algoritmos", "estrutura de dados"),
    skill("Linguagens de programação", "javascript", "typescript", "java", "python", "c#", "php"),
    skill("Desenvolvimento web ou mobile", "react", "angular", "vue", "android", "ios", "flutter"),
    skill("APIs e integrações", "api", "rest", "graphql", "integracao", "integrações"),
    skill("Banco de dados", "sql", "postgresql", "mysql", "mongodb", "banco de dados"),
    skill("Git e testes", "git", "github", "gitlab", "testes", "unit tests"),
  ]),
  profile("data", "Dados e Analytics", "Dados", 2, [
    skill("SQL", "postgresql", "mysql", "bigquery", "snowflake"),
    skill("Excel", "planilhas", "tabela dinamica", "tabela dinâmica"),
    skill("BI e dashboards", "power bi", "powerbi", "tableau", "looker", "dashboard"),
    skill("Python para dados", "python", "pandas", "numpy", "jupyter"),
    skill("Estatística", "estatistica", "análise estatística", "analise estatistica"),
    skill("ETL e modelagem", "etl", "dbt", "pipeline de dados", "modelagem de dados"),
  ]),
  profile("product-projects", "Produto e Projetos", "Produto e Gestão", 3, [
    skill("Planejamento e roadmap", "roadmap", "cronograma", "planejamento de projetos"),
    skill("Discovery e requisitos", "discovery", "levantamento de requisitos", "user research"),
    skill("Métodos ágeis", "agile", "scrum", "kanban", "sprint"),
    skill("Priorização e backlog", "priorizacao", "priorização", "backlog", "user stories"),
    skill("Indicadores", "kpi", "métricas de produto", "metricas de produto", "status report"),
    skill("Gestão de stakeholders", "stakeholders", "gestao de stakeholders", "pmbok", "pmp"),
  ], [ORGANIZATION, COMMUNICATION, COLLABORATION, LEADERSHIP]),
  profile("marketing-communication", "Marketing e Comunicação", "Marketing e Comunicação", 2, [
    skill("Planejamento de campanhas", "campanhas", "plano de marketing", "briefing"),
    skill("Mídia paga", "google ads", "meta ads", "trafego pago", "tráfego pago"),
    skill("Conteúdo e copywriting", "conteudo", "conteúdo", "copywriting", "redacao", "redação"),
    skill("SEO e canais digitais", "seo", "sem", "redes sociais", "social media"),
    skill("Analytics e conversão", "ga4", "google analytics", "conversao", "conversão", "funil"),
    skill("CRM e automação", "crm", "rd station", "hubspot", "email marketing", "automacao"),
  ], [COMMUNICATION, ORGANIZATION, PROBLEM_SOLVING, COLLABORATION]),
  profile("sales", "Vendas e Comercial", "Comercial", 1, [
    skill("Prospecção", "prospeccao", "outbound", "inbound", "cold call"),
    skill("Negociação", "negociacao", "fechamento", "closing"),
    skill("CRM", "salesforce", "hubspot", "pipedrive"),
    skill("Pipeline e forecast", "pipeline", "funil de vendas", "forecast"),
    skill("Metas comerciais", "metas", "quota", "vendas", "receita"),
    skill("Apresentação comercial", "pitch", "demo", "proposta comercial"),
  ], [COMMUNICATION, CUSTOMER_FOCUS, ORGANIZATION, PROBLEM_SOLVING]),
  profile("administrative", "Administrativo e Secretariado", "Administrativo", 1, [
    skill("Pacote Office", "microsoft office", "word", "powerpoint", "outlook"),
    skill("Excel e planilhas", "excel", "planilhas", "tabela dinamica"),
    skill("Rotinas administrativas", "processos administrativos", "backoffice", "arquivo"),
    skill("Agenda e documentos", "agenda", "reunioes", "reuniões", "gestao documental"),
    skill("Atendimento", "recepcao", "recepção", "atendimento ao cliente"),
    skill("ERP e controles", "erp", "sap", "totvs", "sistema de gestao"),
  ], [ORGANIZATION, COMMUNICATION, COLLABORATION, PROBLEM_SOLVING]),
  profile("finance", "Finanças", "Finanças", 2, [
    skill("Excel avançado", "excel", "vba", "tabela dinamica"),
    skill("Fluxo de caixa", "cash flow", "tesouraria"),
    skill("Orçamento e forecast", "orcamento", "orçamento", "budget", "forecast"),
    skill("Demonstrações financeiras", "dre", "balanco", "balanço", "demonstracoes financeiras"),
    skill("Modelagem financeira", "valuation", "financial modeling", "fpa", "fp&a"),
    skill("ERP e conciliação", "sap", "totvs", "oracle", "conciliacao", "conciliação"),
  ]),
  profile("accounting", "Contabilidade e Fiscal", "Contabilidade", 2, [
    skill("Contabilidade geral", "lancamentos contabeis", "lançamentos contábeis", "balancete"),
    skill("Fechamento contábil", "fechamento contabil", "dre", "balanco", "balanço"),
    skill("Fiscal e tributário", "fiscal", "tributario", "tributário", "icms", "iss", "sped"),
    skill("Conciliação", "conciliacao", "conciliação", "contas patrimoniais"),
    skill("ERP contábil", "sap", "totvs", "dominio", "sistema contabil"),
    skill("Auditoria e controles", "auditoria", "controles internos", "compliance"),
  ]),
  profile("hr", "Recursos Humanos", "Pessoas", 2, [
    skill("Recrutamento e seleção", "recrutamento", "selecao", "seleção", "r&s"),
    skill("Entrevistas e hunting", "entrevista por competencia", "hunting", "linkedin recruiter"),
    skill("Departamento pessoal", "folha de pagamento", "admissao", "admissão", "rescisao", "rescisão"),
    skill("Treinamento e desenvolvimento", "t&d", "capacitacao", "capacitação", "onboarding"),
    skill("People Analytics", "indicadores de rh", "people analytics", "turnover"),
    skill("Legislação trabalhista", "legislacao trabalhista", "clt", "e-social", "esocial"),
  ], [COMMUNICATION, ORGANIZATION, COLLABORATION, PROBLEM_SOLVING]),
  profile("customer", "Atendimento e Sucesso do Cliente", "Relacionamento", 1, [
    skill("Atendimento ao cliente", "atendimento", "sac", "suporte", "ouvidoria"),
    skill("CRM e tickets", "crm", "zendesk", "freshdesk", "tickets"),
    skill("Onboarding e implantação", "onboarding", "implantacao", "implantação"),
    skill("Retenção e satisfação", "retencao", "retenção", "churn", "nps", "csat"),
    skill("Gestão de carteira", "gestao de carteira", "carteira de clientes", "account management"),
    skill("Solução de demandas", "resolucao", "resolução", "sla", "tratativa"),
  ], [COMMUNICATION, CUSTOMER_FOCUS, PROBLEM_SOLVING, ORGANIZATION]),
  profile("design-creative", "Design e Criação", "Design e Criatividade", 2, [
    skill("Ferramentas de design", "figma", "photoshop", "illustrator", "adobe"),
    skill("Criação visual", "design grafico", "design gráfico", "direcao de arte", "direção de arte"),
    skill("Prototipação", "prototipacao", "protótipo", "wireframe"),
    skill("Pesquisa e usabilidade", "user research", "usabilidade", "teste com usuario"),
    skill("Design system", "design system", "componentes", "identidade visual"),
    skill("Produção audiovisual", "video", "vídeo", "motion", "edicao", "edição"),
  ], [COLLABORATION, COMMUNICATION, PROBLEM_SOLVING, ORGANIZATION]),
  profile("logistics-procurement", "Logística e Suprimentos", "Logística e Suprimentos", 2, [
    skill("Estoque e inventário", "estoque", "inventario", "inventário", "armazenagem"),
    skill("Supply Chain", "supply chain", "cadeia de suprimentos", "s&op"),
    skill("Transportes e fretes", "transporte", "frete", "roteirizacao", "roteirização"),
    skill("Compras e fornecedores", "compras", "fornecedores", "cotacao", "cotação", "procurement"),
    skill("ERP, WMS e TMS", "erp", "sap", "wms", "tms", "totvs"),
    skill("Indicadores logísticos", "kpi", "sla", "otif", "indicadores logisticos"),
  ]),
  profile("cyber-infra", "Infraestrutura, Cloud e Segurança", "Tecnologia", 2, [
    skill("Redes e servidores", "redes", "tcp ip", "windows server", "linux", "servidores"),
    skill("Cloud", "aws", "azure", "gcp", "cloudflare", "cloud"),
    skill("DevOps e automação", "devops", "ci cd", "terraform", "ansible", "automacao"),
    skill("Containers", "docker", "kubernetes", "containers"),
    skill("Segurança da informação", "seguranca da informacao", "siem", "soc", "vulnerabilidades"),
    skill("Monitoramento e suporte", "monitoramento", "observabilidade", "service desk", "itil"),
  ]),
  profile("legal", "Jurídico e Compliance", "Jurídico", 2, [
    skill("Análise jurídica", "parecer", "jurisprudencia", "jurisprudência", "legislacao", "legislação"),
    skill("Contratos", "contratos", "minutas", "negociacao contratual"),
    skill("Processos judiciais", "peticoes", "petições", "prazos processuais", "contencioso"),
    skill("Direito empresarial e trabalhista", "societario", "societário", "trabalhista", "empresarial"),
    skill("Compliance e LGPD", "compliance", "lgpd", "governanca", "governança"),
    skill("Sistemas jurídicos", "pje", "e-saj", "projuris", "legal one"),
  ], [COMMUNICATION, ORGANIZATION, PROBLEM_SOLVING, COLLABORATION]),
  profile("health", "Saúde e Terapias", "Saúde", 2, [
    skill("Avaliação clínica", "avaliacao clinica", "anamnese", "diagnostico", "diagnóstico"),
    skill("Atendimento ao paciente", "paciente", "atendimento clinico", "acolhimento"),
    skill("Prontuário e registros", "prontuario", "prontuário", "evolucao", "evolução"),
    skill("Protocolos de saúde", "protocolos", "biosseguranca", "biossegurança", "vigilancia"),
    skill("Plano terapêutico", "tratamento", "terapia", "reabilitacao", "reabilitação"),
    skill("Trabalho multidisciplinar", "multidisciplinar", "interdisciplinar", "equipe assistencial"),
  ], [COMMUNICATION, COLLABORATION, ORGANIZATION, CUSTOMER_FOCUS]),
  profile("nursing", "Enfermagem", "Saúde", 1, [
    skill("Assistência de enfermagem", "assistencia de enfermagem", "cuidados de enfermagem"),
    skill("Administração de medicamentos", "medicamentos", "medicacao", "medicação"),
    skill("Sinais vitais", "sinais vitais", "monitorizacao", "monitorização"),
    skill("Protocolos e segurança do paciente", "seguranca do paciente", "protocolos", "nr 32"),
    skill("Prontuário e evolução", "prontuario", "evolucao de enfermagem", "sae"),
    skill("Urgência e emergência", "urgencia", "urgência", "emergencia", "emergência", "uti"),
  ], [COMMUNICATION, COLLABORATION, ORGANIZATION, CUSTOMER_FOCUS]),
  profile("lab-pharma", "Farmácia, Laboratório e Ciências", "Ciências da Vida", 2, [
    skill("Análises laboratoriais", "analises clinicas", "análises clínicas", "laboratorio", "laboratório"),
    skill("Boas práticas", "bpf", "bpl", "boas praticas", "boas práticas"),
    skill("Controle de qualidade", "controle de qualidade", "garantia da qualidade", "validacao"),
    skill("Instrumentação", "instrumentacao", "cromatografia", "hplc", "espectrofotometria"),
    skill("Regulatório", "anvisa", "regulatorio", "regulatório", "farmacopeia"),
    skill("Pesquisa e documentação", "pesquisa clinica", "documentacao tecnica", "procedimento operacional"),
  ]),
  profile("education", "Educação e Pedagogia", "Educação", 1, [
    skill("Planejamento pedagógico", "plano de aula", "planejamento pedagogico", "bncc"),
    skill("Didática", "didatica", "metodologias de ensino", "aprendizagem"),
    skill("Avaliação da aprendizagem", "avaliacao", "avaliação", "provas", "feedback"),
    skill("Gestão de sala", "gestao de sala", "sala de aula", "disciplina"),
    skill("Tecnologias educacionais", "ava", "moodle", "google classroom", "educacao digital"),
    skill("Inclusão educacional", "educacao inclusiva", "inclusao", "inclusão", "necessidades especiais"),
  ], [COMMUNICATION, ORGANIZATION, COLLABORATION, PROBLEM_SOLVING]),
  profile("engineering", "Engenharias", "Engenharia", 2, [
    skill("Projetos de engenharia", "projetos", "dimensionamento", "especificacao tecnica"),
    skill("Desenho técnico", "autocad", "solidworks", "cad", "desenho tecnico"),
    skill("Cálculos e simulações", "calculos", "cálculos", "simulacao", "simulação"),
    skill("Normas técnicas", "abnt", "nr", "normas tecnicas", "iso"),
    skill("Gestão de custos e prazos", "custos", "orcamento", "orçamento", "cronograma"),
    skill("Melhoria e análise de falhas", "melhoria continua", "analise de falhas", "fmea"),
  ]),
  profile("construction-architecture", "Construção e Arquitetura", "Construção Civil", 2, [
    skill("Projetos e plantas", "autocad", "revit", "bim", "plantas"),
    skill("Execução de obras", "obra", "canteiro", "edificacoes", "edificações"),
    skill("Orçamento de obras", "orcamento", "orçamento", "levantamento quantitativo", "composicao de custos"),
    skill("Planejamento de obra", "cronograma", "ms project", "planejamento de obra"),
    skill("Normas e segurança", "nr 18", "abnt", "seguranca do trabalho"),
    skill("Fiscalização e qualidade", "fiscalizacao", "fiscalização", "medicao", "medição", "controle de qualidade"),
  ]),
  profile("operations-industry", "Operações e Produção Industrial", "Operações", 1, [
    skill("Processos produtivos", "producao", "p