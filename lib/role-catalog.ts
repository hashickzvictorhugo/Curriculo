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
    skill("Processos produtivos", "producao", "produção", "linha de producao", "manufatura"),
    skill("Planejamento e controle", "pcp", "planejamento de producao", "ordem de producao"),
    skill("Qualidade", "inspecao", "inspeção", "controle de qualidade", "iso 9001"),
    skill("Lean e melhoria contínua", "lean", "kaizen", "5s", "six sigma", "melhoria continua"),
    skill("Máquinas e equipamentos", "maquinas", "máquinas", "equipamentos", "setup"),
    skill("Indicadores operacionais", "oee", "produtividade", "refugo", "indicadores"),
  ]),
  profile("maintenance-technical", "Manutenção e Ofícios Técnicos", "Manutenção", 1, [
    skill("Manutenção preventiva", "manutencao preventiva", "preventiva", "plano de manutencao"),
    skill("Manutenção corretiva", "manutencao corretiva", "corretiva", "reparo"),
    skill("Leitura de diagramas", "diagrama", "esquema eletrico", "desenho tecnico"),
    skill("Diagnóstico de falhas", "diagnostico de falhas", "analise de falhas", "troubleshooting"),
    skill("Ferramentas e instrumentos", "multimetro", "ferramentas", "instrumentos de medicao"),
    skill("Segurança e normas", "nr 10", "nr 12", "nr 35", "seguranca"),
  ]),
  profile("retail", "Varejo e Loja", "Varejo", 1, [
    skill("Atendimento e vendas", "atendimento", "vendas", "abordagem", "cliente"),
    skill("Operação de caixa", "caixa", "pdv", "pagamentos", "fechamento de caixa"),
    skill("Estoque e reposição", "estoque", "reposicao", "reposição", "inventario"),
    skill("Merchandising", "merchandising", "exposicao", "exposição", "planograma"),
    skill("Metas e indicadores", "metas", "ticket medio", "conversao", "vendas por metro"),
    skill("Prevenção de perdas", "prevencao de perdas", "quebra", "perdas"),
  ], [CUSTOMER_FOCUS, COMMUNICATION, ORGANIZATION, COLLABORATION]),
  profile("hospitality-food", "Hotelaria, Eventos e Alimentação", "Serviços", 1, [
    skill("Atendimento e hospitalidade", "hospitalidade", "hospede", "hóspede", "atendimento"),
    skill("Operação de alimentos", "cozinha", "preparo", "ficha tecnica", "mise en place"),
    skill("Boas práticas de alimentos", "boas praticas", "vigilancia sanitaria", "higiene"),
    skill("Reservas e eventos", "reservas", "eventos", "check in", "check-in"),
    skill("Custos e estoque", "cmv", "estoque", "compras", "controle de custos"),
    skill("Serviço e experiência", "servico de mesa", "serviço de mesa", "satisfacao", "experiencia do cliente"),
  ], [CUSTOMER_FOCUS, COMMUNICATION, ORGANIZATION, COLLABORATION]),
  profile("environment-agri", "Meio Ambiente e Agronegócio", "Meio Ambiente e Agro", 2, [
    skill("Gestão ambiental", "gestao ambiental", "licenciamento", "impacto ambiental"),
    skill("ESG e sustentabilidade", "esg", "sustentabilidade", "emissoes", "residuos"),
    skill("Produção agropecuária", "agricultura", "pecuaria", "safra", "manejo"),
    skill("Geoprocessamento", "gis", "arcgis", "qgis", "geoprocessamento"),
    skill("Qualidade e certificações", "iso 14001", "certificacao", "rastreabilidade"),
    skill("Legislação e segurança", "legislacao ambiental", "nr 31", "ibama", "conama"),
  ]),
  profile("transport", "Transportes e Frota", "Transportes", 1, [
    skill("Condução segura", "direcao defensiva", "direção defensiva", "cnh", "conducao"),
    skill("Rotas e entregas", "rotas", "entregas", "roteirizacao", "gps"),
    skill("Frota", "gestao de frota", "frota", "manutencao de veiculos"),
    skill("Documentação de transporte", "cte", "mdfe", "nota fiscal", "documentacao"),
    skill("Carga e descarga", "carga", "descarga", "movimentacao", "amarração"),
    skill("Prazos e ocorrências", "prazo", "ocorrencias", "tracking", "canhoto"),
  ], [ORGANIZATION, CUSTOMER_FOCUS, COMMUNICATION, PROBLEM_SOLVING]),
  profile("public-social", "Setor Público e Impacto Social", "Público e Social", 2, [
    skill("Políticas públicas", "politicas publicas", "gestao publica", "servico publico"),
    skill("Projetos sociais", "projetos sociais", "impacto social", "terceiro setor"),
    skill("Atendimento socioassistencial", "assistencia social", "acolhimento", "comunidade"),
    skill("Captação de recursos", "captacao", "captação", "editais", "prestacao de contas"),
    skill("Articulação institucional", "articulacao", "articulação", "parcerias", "rede de protecao"),
    skill("Indicadores e relatórios", "indicadores sociais", "relatorios", "monitoramento"),
  ], [COMMUNICATION, COLLABORATION, ORGANIZATION, PROBLEM_SOLVING]),
  profile("security", "Segurança e Proteção", "Segurança", 1, [
    skill("Controle de acesso", "controle de acesso", "portaria", "identificacao"),
    skill("Rondas e vigilância", "ronda", "vigilancia", "monitoramento"),
    skill("Prevenção de riscos", "prevencao", "risco", "seguranca patrimonial"),
    skill("Resposta a emergências", "emergencia", "primeiros socorros", "combate a incendio"),
    skill("CFTV e alarmes", "cftv", "alarme", "central de monitoramento"),
    skill("Registros e protocolos", "livro de ocorrencias", "procedimentos", "protocolos"),
  ], [ORGANIZATION, COMMUNICATION, PROBLEM_SOLVING, COLLABORATION]),
  profile("realestate-insurance", "Imobiliário e Seguros", "Imobiliário e Seguros", 2, [
    skill("Prospecção e atendimento", "prospeccao", "captação", "atendimento", "leads"),
    skill("Negociação e fechamento", "negociacao", "fechamento", "proposta"),
    skill("Contratos e documentação", "contratos", "documentacao", "escritura", "apolice"),
    skill("Avaliação e risco", "avaliacao", "vistoria", "analise de risco", "subscricao"),
    skill("CRM e carteira", "crm", "carteira", "renovacao", "follow up"),
    skill("Regulação e conformidade", "susep", "creci", "regulacao", "compliance"),
  ], [COMMUNICATION, CUSTOMER_FOCUS, ORGANIZATION, PROBLEM_SOLVING]),
  profile("leadership-consulting", "Liderança e Consultoria", "Gestão e Estratégia", 4, [
    skill("Estratégia de negócios", "estrategia", "planejamento estrategico", "business plan"),
    skill("Gestão de pessoas", "gestao de pessoas", "lideranca", "desenvolvimento de equipe"),
    skill("Gestão financeira", "p&l", "dre", "orcamento", "budget"),
    skill("Processos e transformação", "processos", "transformacao", "melhoria continua"),
    skill("Análise e solução", "analise de negocio", "diagnostico", "consultoria"),
    skill("Governança e indicadores", "governanca", "kpi", "okr", "conselho"),
  ], [LEADERSHIP, COMMUNICATION, ORGANIZATION, PROBLEM_SOLVING]),
];

const OCCUPATION_GROUPS: Array<{ profileId: string; titles: string[] }> = [
  { profileId: "software", titles: [
    "Desenvolvedor(a) de Software", "Desenvolvedor(a) Front-end", "Desenvolvedor(a) Back-end", "Desenvolvedor(a) Full Stack", "Desenvolvedor(a) Mobile", "Desenvolvedor(a) Web", "Desenvolvedor(a) Java", "Desenvolvedor(a) .NET", "Desenvolvedor(a) PHP", "Engenheiro(a) de Software",
  ] },
  { profileId: "data", titles: [
    "Analista de Dados", "Analista de BI", "Cientista de Dados", "Engenheiro(a) de Dados", "Analista de Analytics", "Administrador(a) de Banco de Dados", "Arquiteto(a) de Dados", "Especialista em Machine Learning", "Analista de Pesquisa", "Analista de Inteligência de Mercado",
  ] },
  { profileId: "product-projects", titles: [
    "Product Manager", "Product Owner", "Gerente de Projetos", "Analista de Projetos", "Coordenador(a) de Projetos", "Analista de PMO", "Scrum Master", "Agile Coach", "Analista de Produto", "Gerente de Programas",
  ] },
  { profileId: "marketing-communication", titles: [
    "Analista de Marketing", "Analista de Marketing Digital", "Analista de Growth", "Especialista em SEO", "Social Media", "Analista de Conteúdo", "Copywriter", "Relações Públicas", "Assessor(a) de Imprensa", "Coordenador(a) de Marketing",
  ] },
  { profileId: "sales", titles: [
    "Vendedor(a)", "SDR", "BDR", "Executivo(a) de Vendas", "Consultor(a) Comercial", "Executivo(a) de Contas", "Representante Comercial", "Supervisor(a) de Vendas", "Analista de Sales Operations", "Gerente Comercial",
  ] },
  { profileId: "administrative", titles: [
    "Auxiliar Administrativo(a)", "Assistente Administrativo(a)", "Analista Administrativo(a)", "Secretário(a) Executivo(a)", "Recepcionista", "Office Manager", "Assistente de Backoffice", "Assistente de Diretoria", "Digitador(a)", "Arquivista",
  ] },
  { profileId: "finance", titles: [
    "Analista Financeiro(a)", "Assistente Financeiro(a)", "Analista de Tesouraria", "Analista de Contas a Pagar", "Analista de Contas a Receber", "Analista de Crédito", "Controller", "Analista de FP&A", "Analista de Cobrança", "Analista de Investimentos",
  ] },
  { profileId: "accounting", titles: [
    "Contador(a)", "Assistente Contábil", "Analista Contábil", "Analista Fiscal", "Assistente Fiscal", "Auditor(a) Contábil", "Analista de Custos", "Analista Tributário(a)", "Perito(a) Contábil", "Coordenador(a) Contábil",
  ] },
  { profileId: "hr", titles: [
    "Analista de Recursos Humanos", "Recrutador(a)", "Analista de Departamento Pessoal", "HR Business Partner", "Analista de DHO", "Analista de Folha de Pagamento", "Analista de Cargos e Salários", "Analista de People Analytics", "Talent Acquisition", "Analista de Treinamento",
  ] },
  { profileId: "customer", titles: [
    "Customer Success", "Analista de Suporte ao Cliente", "Atendente", "Operador(a) de SAC", "Analista de Customer Experience", "Analista de Ouvidoria", "Consultor(a) de Implantação", "Gerente de Contas", "Especialista de Onboarding", "Técnico(a) de Suporte",
  ] },
  { profileId: "design-creative", titles: [
    "UX/UI Designer", "Designer Gráfico(a)", "Product Designer", "Motion Designer", "Ilustrador(a)", "Editor(a) de Vídeo", "Diretor(a) de Arte", "Fotógrafo(a)", "Web Designer", "Designer de Marca",
  ] },
  { profileId: "logistics-procurement", titles: [
    "Analista de Logística", "Analista de Supply Chain", "Estoquista", "Auxiliar de Armazém", "Comprador(a)", "Analista de Compras", "Analista de Importação e Exportação", "Planejador(a) de Demanda", "Expedidor(a)", "Supervisor(a) de Armazém",
  ] },
  { profileId: "cyber-infra", titles: [
    "Analista de Segurança da Informação", "Analista de SOC", "Engenheiro(a) de Cloud", "Engenheiro(a) DevOps", "Site Reliability Engineer", "Analista de Redes", "Administrador(a) de Sistemas", "Analista de Infraestrutura", "Arquiteto(a) de Cloud", "Analista de Service Desk",
  ] },
  { profileId: "legal", titles: [
    "Advogado(a) Cível", "Advogado(a) Trabalhista", "Advogado(a) Empresarial", "Assistente Jurídico(a)", "Analista Jurídico(a)", "Analista de Compliance", "Encarregado(a) de Dados - DPO", "Analista de Contratos", "Advogado(a) Tributário(a)", "Controller Jurídico(a)",
  ] },
  { profileId: "health", titles: [
    "Médico(a)", "Dentista", "Fisioterapeuta", "Psicólogo(a)", "Nutricionista", "Terapeuta Ocupacional", "Fonoaudiólogo(a)", "Educador(a) Físico(a)", "Técnico(a) em Radiologia", "Agente Comunitário(a) de Saúde",
  ] },
  { profileId: "nursing", titles: [
    "Enfermeiro(a)", "Técnico(a) de Enfermagem", "Auxiliar de Enfermagem", "Enfermeiro(a) Obstetra", "Enfermeiro(a) de UTI", "Enfermeiro(a) de Emergência", "Enfermeiro(a) Auditor(a)", "Coordenador(a) de Enfermagem", "Cuidador(a) de Idosos", "Instrumentador(a) Cirúrgico(a)",
  ] },
  { profileId: "lab-pharma", titles: [
    "Farmacêutico(a)", "Biomédico(a)", "Analista de Laboratório", "Técnico(a) de Laboratório", "Químico(a)", "Biólogo(a)", "Microbiologista", "Analista de Pesquisa Clínica", "Analista de Qualidade Farmacêutica", "Operador(a) de Produção Farmacêutica",
  ] },
  { profileId: "education", titles: [
    "Professor(a) de Educação Infantil", "Professor(a) do Ensino Fundamental", "Professor(a) de Português", "Professor(a) de Matemática", "Professor(a) de Inglês", "Professor(a) de História", "Professor(a) de Geografia", "Pedagogo(a)", "Coordenador(a) Pedagógico(a)", "Tutor(a) de Ensino a Distância",
  ] },
  { profileId: "engineering", titles: [
    "Engenheiro(a) Mecânico(a)", "Engenheiro(a) Eletricista", "Engenheiro(a) de Produção", "Engenheiro(a) Químico(a)", "Engenheiro(a) de Computação", "Engenheiro(a) de Automação", "Engenheiro(a) de Telecomunicações", "Engenheiro(a) Mecatrônico(a)", "Engenheiro(a) de Segurança do Trabalho", "Engenheiro(a) de Aplicação",
  ] },
  { profileId: "construction-architecture", titles: [
    "Engenheiro(a) Civil", "Arquiteto(a)", "Técnico(a) em Edificações", "Mestre de Obras", "Pedreiro(a)", "Pintor(a) de Obras", "Carpinteiro(a)", "Topógrafo(a)", "Desenhista Projetista", "Orçamentista de Obras",
  ] },
  { profileId: "operations-industry", titles: [
    "Operador(a) de Produção", "Analista de Produção", "Analista de PCP", "Analista de Qualidade", "Supervisor(a) de Produção", "Gerente Industrial", "Analista de Processos", "Operador(a) de Máquinas", "Inspetor(a) de Qualidade", "Auxiliar de Embalagem",
  ] },
  { profileId: "maintenance-technical", titles: [
    "Eletricista", "Mecânico(a) Industrial", "Mecânico(a) Automotivo(a)", "Eletrotécnico(a)", "Técnico(a) em Eletrônica", "Técnico(a) em Climatização", "Soldador(a)", "Torneiro(a) Mecânico(a)", "Técnico(a) de Manutenção", "Técnico(a) em Refrigeração",
  ] },
  { profileId: "retail", titles: [
    "Operador(a) de Caixa", "Atendente de Loja", "Vendedor(a) de Loja", "Gerente de Loja", "Supervisor(a) de Loja", "Promotor(a) de Vendas", "Repositor(a)", "Fiscal de Prevenção de Perdas", "Visual Merchandiser", "Consultor(a) de Franquias",
  ] },
  { profileId: "hospitality-food", titles: [
    "Chef de Cozinha", "Cozinheiro(a)", "Auxiliar de Cozinha", "Garçom/Garçonete", "Bartender", "Recepcionista de Hotel", "Gerente de Hotel", "Produtor(a) de Eventos", "Guia de Turismo", "Confeiteiro(a)",
  ] },
  { profileId: "environment-agri", titles: [
    "Analista Ambiental", "Engenheiro(a) Ambiental", "Engenheiro(a) Agrônomo(a)", "Médico(a) Veterinário(a)", "Técnico(a) Agrícola", "Gerente de Fazenda", "Zootecnista", "Engenheiro(a) Florestal", "Geólogo(a)", "Analista de ESG",
  ] },
  { profileId: "transport", titles: [
    "Motorista de Caminhão", "Motorista de Entregas", "Motociclista Entregador(a)", "Gestor(a) de Frota", "Despachante de Transportes", "Auxiliar de Carga e Descarga", "Analista de Tráfego", "Operador(a) Ferroviário(a)", "Motorista de Ônibus", "Motorista Executivo(a)",
  ] },
  { profileId: "public-social", titles: [
    "Assistente Social", "Analista de Políticas Públicas", "Coordenador(a) de Projetos Sociais", "Educador(a) Social", "Analista de Captação de Recursos", "Gestor(a) Público(a)", "Analista de Serviço Público", "Analista de Relações Internacionais", "Cientista Político(a)", "Agente de Desenvolvimento Social",
  ] },
  { profileId: "security", titles: [
    "Vigilante", "Agente de Segurança Patrimonial", "Técnico(a) de Segurança do Trabalho", "Bombeiro(a) Civil", "Investigador(a) Particular", "Porteiro(a)", "Controlador(a) de Acesso", "Supervisor(a) de Segurança", "Agente Penitenciário(a)", "Salva-vidas",
  ] },
  { profileId: "realestate-insurance", titles: [
    "Corretor(a) de Imóveis", "Administrador(a) de Condomínios", "Avaliador(a) de Imóveis", "Consultor(a) de Locação", "Analista Imobiliário(a)", "Corretor(a) de Seguros", "Analista de Sinistros", "Subscritor(a) de Seguros", "Analista Atuarial", "Consultor(a) de Seguros",
  ] },
  { profileId: "leadership-consulting", titles: [
    "Gerente Geral", "Gerente de Operações", "Consultor(a) de Negócios", "Analista de Estratégia", "Consultor(a) de Gestão", "Analista de Negócios", "Empreendedor(a)", "Chief of Staff", "Diretor(a) Comercial", "Diretor(a) de Operações",
  ] },
];

const profileById = new Map(ROLE_PROFILES.map((item) => [item.id, item]));

export const OCCUPATIONS: OccupationOption[] = OCCUPATION_GROUPS.flatMap((group) => {
  const area = profileById.get(group.profileId)?.area ?? "Outras áreas";
  return group.titles.map((title) => ({
    id: `${group.profileId}-${slugify(title)}`.slice(0, 78),
    title,
    area,
    profileId: group.profileId,
    aliases: titleAliases(title),
  }));
}).sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

export function findOccupation(value: string): OccupationOption | null {
  const normalized = normalizeCatalogValue(value);
  if (!normalized) return null;
  return OCCUPATIONS.find((occupation) =>
    occupation.id === value ||
    normalizeCatalogValue(occupation.title) === normalized ||
    occupation.aliases.some((alias) => normalizeCatalogValue(alias) === normalized),
  ) ?? null;
}

export function getProfileById(profileId: string): RoleProfile | null {
  if (profileId === GENERIC_PROFILE.id) return GENERIC_PROFILE;
  return profileById.get(profileId) ?? null;
}

export function createRoleId(title: string): string {
  return `custom-${slugify(title) || "profissao"}`.slice(0, 78);
}

function titleAliases(title: string): string[] {
  const neutral = title.replace(/\([ao]\)/gi, "").replace(/\s+/g, " ").trim();
  const withoutSpecialty = neutral.split(" - ")[0].trim();
  return [...new Set([neutral, withoutSpecialty])].filter((alias) => alias !== title);
}

function slugify(value: string): string {
  return normalizeCatalogValue(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 62);
}

function normalizeCatalogValue(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\([ao]\)/g, "").replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}
