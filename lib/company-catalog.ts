export type CompanySector = {
  id: string;
  label: string;
  aliases: string[];
};

export type CompanyPriority = {
  id: string;
  label: string;
  aliases: string[];
};

export const COMPANY_SECTORS: CompanySector[] = [
  {
    id: "technology",
    label: "Tecnologia e software",
    aliases: ["tecnologia", "software", "saas", "sistemas", "digital", "plataforma", "aplicativo", "startup"],
  },
  {
    id: "financial",
    label: "Serviços financeiros e fintech",
    aliases: ["financeiro", "fintech", "banco", "bancario", "credito", "pagamentos", "investimentos", "mercado financeiro"],
  },
  {
    id: "retail",
    label: "Varejo e e-commerce",
    aliases: ["varejo", "ecommerce", "e-commerce", "loja", "marketplace", "consumidor", "merchandising", "comercio"],
  },
  {
    id: "industry",
    label: "Indústria e manufatura",
    aliases: ["industria", "manufatura", "fabrica", "producao", "chao de fabrica", "industrial", "linha de producao"],
  },
  {
    id: "health",
    label: "Saúde e bem-estar",
    aliases: ["saude", "hospital", "clinica", "paciente", "assistencial", "medicina", "bem estar", "terapeutico"],
  },
  {
    id: "education",
    label: "Educação",
    aliases: ["educacao", "ensino", "escola", "universidade", "aluno", "pedagogico", "aprendizagem", "curso"],
  },
  {
    id: "logistics",
    label: "Logística e transportes",
    aliases: ["logistica", "transporte", "supply chain", "distribuicao", "armazenagem", "frete", "entrega", "frota"],
  },
  {
    id: "construction",
    label: "Construção e imobiliário",
    aliases: ["construcao", "obra", "engenharia civil", "imobiliario", "incorporacao", "edificacao", "canteiro", "imovel"],
  },
  {
    id: "agribusiness",
    label: "Agronegócio",
    aliases: ["agronegocio", "agro", "agricultura", "pecuaria", "fazenda", "rural", "safra", "cultivo"],
  },
  {
    id: "energy",
    label: "Energia e utilities",
    aliases: ["energia", "eletrico", "eletricidade", "solar", "eolica", "gas", "saneamento", "utilities"],
  },
  {
    id: "telecom",
    label: "Telecomunicações",
    aliases: ["telecomunicacoes", "telecom", "telefonia", "rede", "conectividade", "fibra", "internet", "5g"],
  },
  {
    id: "marketing-media",
    label: "Marketing, comunicação e mídia",
    aliases: ["marketing", "comunicacao", "midia", "publicidade", "agencia", "conteudo", "audiovisual", "imprensa"],
  },
  {
    id: "consulting",
    label: "Consultoria e serviços profissionais",
    aliases: ["consultoria", "consultor", "servicos profissionais", "auditoria", "assessoria", "projeto", "cliente corporativo"],
  },
  {
    id: "food-beverage",
    label: "Alimentos e bebidas",
    aliases: ["alimentos", "bebidas", "alimenticio", "restaurante", "food service", "cozinha", "nutricao", "qualidade de alimentos"],
  },
  {
    id: "hospitality",
    label: "Turismo, hotelaria e eventos",
    aliases: ["turismo", "hotelaria", "hotel", "hospedagem", "eventos", "viagem", "hospitalidade", "recepcao"],
  },
  {
    id: "government-third-sector",
    label: "Governo e terceiro setor",
    aliases: ["governo", "setor publico", "politicas publicas", "ong", "terceiro setor", "impacto social", "servico publico", "comunidade"],
  },
  {
    id: "legal",
    label: "Jurídico",
    aliases: ["juridico", "direito", "advocacia", "legal", "contratos", "processo judicial", "compliance", "regulatorio"],
  },
  {
    id: "insurance",
    label: "Seguros",
    aliases: ["seguros", "seguradora", "sinistro", "apolice", "subscricao", "atuarial", "corretora", "risco"],
  },
  {
    id: "automotive",
    label: "Automotivo",
    aliases: ["automotivo", "veiculo", "automovel", "montadora", "concessionaria", "autopecas", "oficina", "mobilidade"],
  },
  {
    id: "pharma-biotech",
    label: "Farmacêutico e biotecnologia",
    aliases: ["farmaceutico", "farmacia", "biotecnologia", "laboratorio", "medicamento", "pesquisa clinica", "anvisa", "ciencias da vida"],
  },
  {
    id: "mining-metals",
    label: "Mineração e siderurgia",
    aliases: ["mineracao", "siderurgia", "mina", "metalurgia", "minerio", "geologia", "aco", "beneficiamento"],
  },
  {
    id: "fashion-beauty",
    label: "Moda e beleza",
    aliases: ["moda", "beleza", "cosmeticos", "vestuario", "estetica", "fashion", "salao", "confeccao"],
  },
  {
    id: "entertainment",
    label: "Entretenimento, cultura e esportes",
    aliases: ["entretenimento", "cultura", "esporte", "games", "musica", "cinema", "producao cultural", "streaming"],
  },
  {
    id: "other",
    label: "Outro ou multissetorial",
    aliases: [],
  },
];

export const COMPANY_PRIORITIES: CompanyPriority[] = [
  {
    id: "customer",
    label: "Foco no cliente",
    aliases: ["cliente", "consumidor", "customer centric", "satisfacao", "nps", "csat", "experiencia do cliente", "atendimento"],
  },
  {
    id: "innovation",
    label: "Inovação",
    aliases: ["inovacao", "transformacao", "melhoria", "novas solucoes", "experimentacao", "tecnologia", "produto digital", "automacao"],
  },
  {
    id: "results",
    label: "Resultados",
    aliases: ["resultados", "metas", "indicadores", "kpi", "performance", "crescimento", "receita", "eficiencia"],
  },
  {
    id: "collaboration",
    label: "Colaboração",
    aliases: ["colaboracao", "trabalho em equipe", "equipe", "multidisciplinar", "parceria", "stakeholders", "cooperacao"],
  },
  {
    id: "autonomy",
    label: "Autonomia",
    aliases: ["autonomia", "protagonismo", "iniciativa", "ownership", "lideranca", "tomada de decisao", "responsabilidade"],
  },
  {
    id: "agility",
    label: "Agilidade",
    aliases: ["agilidade", "agile", "scrum", "kanban", "rapidez", "adaptabilidade", "priorizacao", "entregas"],
  },
  {
    id: "quality",
    label: "Qualidade",
    aliases: ["qualidade", "excelencia", "padronizacao", "auditoria", "controle", "melhoria continua", "sla", "precisao"],
  },
  {
    id: "safety",
    label: "Segurança",
    aliases: ["seguranca", "prevencao", "risco", "normas", "conformidade", "compliance", "lgpd", "saude ocupacional"],
  },
  {
    id: "diversity",
    label: "Diversidade e inclusão",
    aliases: ["diversidade", "inclusao", "equidade", "acessibilidade", "pertencimento", "pluralidade", "grupos diversos"],
  },
  {
    id: "sustainability",
    label: "Sustentabilidade",
    aliases: ["sustentabilidade", "esg", "ambiental", "impacto social", "emissoes", "residuos", "responsabilidade social"],
  },
  {
    id: "learning",
    label: "Aprendizado contínuo",
    aliases: ["aprendizado", "desenvolvimento", "capacitacao", "treinamento", "certificacao", "mentoria", "conhecimento"],
  },
  {
    id: "ethics",
    label: "Ética e transparência",
    aliases: ["etica", "transparencia", "integridade", "governanca", "compliance", "conduta", "prestacao de contas"],
  },
];

export function getCompanySector(sectorId: string): CompanySector | null {
  return COMPANY_SECTORS.find((sector) => sector.id === sectorId) ?? null;
}

export function getCompanyPriorities(priorityIds: string[]): CompanyPriority[] {
  const selected = new Set(priorityIds);
  return COMPANY_PRIORITIES.filter((priority) => selected.has(priority.id));
}
