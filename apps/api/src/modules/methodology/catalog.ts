export type MethodologyStageCode = "I" | "D" | "E" | "A" | "L";

export type MethodologyFieldType = "text" | "textarea" | "number" | "date" | "checkbox" | "select" | "json";

export type MethodologyFieldDefinition = {
  code: string;
  label: string;
  type: MethodologyFieldType;
  required?: boolean;
  placeholder?: string;
  helpText: string;
  acceptanceCriteria?: string;
  sourceReference: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
};

export type MethodologySectionDefinition = {
  code: string;
  title: string;
  description: string;
  fields: MethodologyFieldDefinition[];
};

export type MethodologyArtifactDefinition = {
  code: string;
  name: string;
  stage: MethodologyStageCode;
  visibility: "internal" | "client";
  description: string;
  sections: MethodologySectionDefinition[];
};

const statusOptions = [
  { value: "not_started", label: "Nao iniciada" },
  { value: "in_progress", label: "Em andamento" },
  { value: "ready_for_completion", label: "Pronta para conclusao" },
  { value: "completed", label: "Concluida" },
  { value: "reopened", label: "Reaberta" }
];

const stageLabel: Record<MethodologyStageCode, string> = {
  I: "Imersao",
  D: "Diagnostico",
  E: "Estrutura",
  A: "Arquitetura",
  L: "Loop"
};

export const methodologyArtifacts: MethodologyArtifactDefinition[] = [
  {
    code: "TEMPLATE_PLANO_DE_IMERSAO",
    name: "Plano de Imersao",
    stage: "I",
    visibility: "internal",
    description: "Planejamento das entrevistas, pesquisa preliminar e mapa de stakeholders.",
    sections: [
      {
        code: "dados_contextuais",
        title: "Dados Cadastrais e Contextuais",
        description: "Consolidar dados da empresa antes da primeira entrevista.",
        fields: [
          {
            code: "empresa",
            label: "Empresa",
            type: "text",
            required: true,
            helpText: "Preencha com o nome oficial da empresa cliente conforme contrato e CNPJ.",
            acceptanceCriteria: "Nome oficial preenchido e consistente com dados do projeto.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 1"
          },
          {
            code: "cnpj",
            label: "CNPJ",
            type: "text",
            required: true,
            helpText: "Informe o CNPJ principal. Se nao houver, registre justificativa em observacoes.",
            acceptanceCriteria: "CNPJ ou justificativa de ausencia registrada.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 1"
          },
          {
            code: "segmento_atuacao",
            label: "Segmento de Atuacao",
            type: "text",
            required: true,
            helpText: "Descreva o segmento principal e, se aplicavel, subsegmentos atendidos.",
            acceptanceCriteria: "Segmento principal identificado.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 1"
          },
          {
            code: "contexto_inicial",
            label: "Contexto Inicial do Projeto",
            type: "textarea",
            required: true,
            helpText: "Resuma por que o cliente procurou a MKT Real e expectativas iniciais.",
            acceptanceCriteria: "Resumo narrativo com motivacao e expectativa principal.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 1"
          }
        ]
      },
      {
        code: "pesquisa_preliminar",
        title: "Pesquisa Preliminar",
        description: "Registrar analise inicial de site, concorrencia e hipoteses do consultor.",
        fields: [
          {
            code: "analise_site",
            label: "Analise do Site e Presenca Digital",
            type: "textarea",
            required: true,
            helpText: "Registre impressao do site, proposta de valor percebida e presenca em redes.",
            acceptanceCriteria: "Inclui impressao geral, proposta de valor e observacoes de redes.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 2.1"
          },
          {
            code: "analise_mercado_concorrencia",
            label: "Pesquisa de Mercado e Concorrencia",
            type: "textarea",
            required: true,
            helpText: "Liste concorrentes, tendencias e noticias relevantes com observacoes do consultor.",
            acceptanceCriteria: "Pelo menos 2 concorrentes e 2 tendencias registradas.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 2.2"
          },
          {
            code: "hipoteses_iniciais",
            label: "Hipoteses Iniciais do Consultor",
            type: "textarea",
            required: true,
            helpText: "Documente hipoteses de trabalho que serao confirmadas ou refutadas nas entrevistas.",
            acceptanceCriteria: "Ao menos 3 hipoteses e 3 pontos de atencao.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 2.3"
          }
        ]
      },
      {
        code: "planejamento_entrevistas",
        title: "Mapa de Stakeholders e Agenda",
        description: "Definir cenarios, stakeholders, roteiros e agenda.",
        fields: [
          {
            code: "cenario_aplicacao",
            label: "Cenario de Aplicacao",
            type: "select",
            required: true,
            options: [
              { value: "A", label: "A - Minimo Viavel" },
              { value: "B", label: "B - Padrao" },
              { value: "C", label: "C - Ideal" }
            ],
            helpText: "Escolha o cenario conforme disponibilidade de stakeholders e profundidade desejada.",
            acceptanceCriteria: "Cenario selecionado e coerente com agenda.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 3"
          },
          {
            code: "stakeholders_mapa",
            label: "Mapa de Stakeholders",
            type: "textarea",
            required: true,
            helpText: "Liste stakeholders, papel no negocio, roteiros atribuidos e restricoes.",
            acceptanceCriteria: "Stakeholders obrigatorios mapeados (CEO, comercial, marketing).",
            sourceReference: "MANUAL_METODOLOGICO_IMERSAO - Secao 5"
          },
          {
            code: "agenda_entrevistas",
            label: "Agenda de Entrevistas",
            type: "textarea",
            required: true,
            helpText: "Registre datas, horarios, formato, objetivo e roteiro de cada entrevista.",
            acceptanceCriteria: "Agenda completa com ordem recomendada e duracao estimada.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 4"
          },
          {
            code: "checklist_momento1",
            label: "Checklist de Conclusao do Momento 1",
            type: "checkbox",
            required: true,
            helpText: "Marque quando todos os itens obrigatorios do Momento 1 estiverem completos.",
            acceptanceCriteria: "Checklist marcado somente apos validacao interna.",
            sourceReference: "TEMPLATE_PLANO_DE_IMERSAO - Secao 6"
          }
        ]
      }
    ]
  },
  {
    code: "TEMPLATE_DOSSIE_DE_IMERSAO",
    name: "Dossie de Imersao",
    stage: "I",
    visibility: "internal",
    description: "Consolidacao de entrevistas, sintese interpretativa, premissas, lacunas e insumos para etapas seguintes.",
    sections: [
      {
        code: "entrevistas",
        title: "Registro de Entrevistas",
        description: "Rastreabilidade completa das entrevistas realizadas e nao realizadas.",
        fields: [
          {
            code: "entrevistas_realizadas",
            label: "Entrevistas Realizadas",
            type: "textarea",
            required: true,
            helpText: "Registre stakeholder, cargo, data, formato, duracao e observacoes por entrevista.",
            acceptanceCriteria: "Todas as entrevistas executadas estao listadas.",
            sourceReference: "TEMPLATE_DOSSIE_DE_IMERSAO - Secao 1"
          },
          {
            code: "entrevistas_nao_realizadas",
            label: "Entrevistas Nao Realizadas",
            type: "textarea",
            helpText: "Descreva entrevistas previstas nao realizadas, motivo e impacto de cobertura.",
            acceptanceCriteria: "Lacunas de acesso justificadas, quando houver.",
            sourceReference: "TEMPLATE_DOSSIE_DE_IMERSAO - Secao 1"
          }
        ]
      },
      {
        code: "consolidacao_analitica",
        title: "Consolidacao, Sintese e Premissas",
        description: "Interpretacao integrada por dimensoes, alertas, premissas e lacunas.",
        fields: [
          {
            code: "sintese_dimensoes",
            label: "Sintese Interpretativa (DIM_1 a DIM_6)",
            type: "textarea",
            required: true,
            helpText: "Produza narrativa por dimensao estrategica, conectando evidencias de multiplos roteiros.",
            acceptanceCriteria: "As 6 dimensoes estao preenchidas com interpretacao (nao copia bruta).",
            sourceReference: "MANUAL_METODOLOGICO_IMERSAO - Secao 7"
          },
          {
            code: "premissas_estrategicas",
            label: "Premissas Estrategicas",
            type: "textarea",
            required: true,
            helpText: "Documente premissas com origem, grau de confianca, impacto e acao.",
            acceptanceCriteria: "Premissas rastreaveis e acionaveis registradas.",
            sourceReference: "MANUAL_METODOLOGICO_IMERSAO - Secao 8"
          },
          {
            code: "alertas_estruturais",
            label: "Alertas Estruturais",
            type: "textarea",
            helpText: "Registre divergencias significativas entre stakeholders e justificativa da sintese prevalente.",
            acceptanceCriteria: "Divergencias significativas documentadas, quando existirem.",
            sourceReference: "TEMPLATE_DOSSIE_DE_IMERSAO - Secao 3"
          },
          {
            code: "lacunas",
            label: "Lacunas de Informacao",
            type: "textarea",
            required: true,
            helpText: "Informe lacunas, impacto e acao necessaria (investigar, solicitar ou validar premissa).",
            acceptanceCriteria: "Lacunas criticas explicitadas e vinculadas ao impacto.",
            sourceReference: "MANUAL_METODOLOGICO_IMERSAO - Secao 6"
          }
        ]
      }
    ]
  },
  {
    code: "TEMPLATE_RELATORIO_CLIENTE_IMERSAO",
    name: "Relatorio Cliente - Imersao",
    stage: "I",
    visibility: "client",
    description: "Versao executiva da imersao para apresentacao ao cliente.",
    sections: [
      {
        code: "sumario_executivo",
        title: "Sumario Executivo",
        description: "Sintese de 1 pagina com achados e contexto estrategico.",
        fields: [
          {
            code: "sumario",
            label: "Sumario Executivo",
            type: "textarea",
            required: true,
            helpText: "Consolidar quem e a empresa, momento atual, forcas, gargalos e proximos passos.",
            acceptanceCriteria: "Texto executivo claro, sem expor mecanica interna da metodologia.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_IMERSAO - Sumario Executivo"
          }
        ]
      },
      {
        code: "capitulos_imersao",
        title: "Capitulos da Imersao",
        description: "Preencher os capitulos obrigatorios da estrutura cliente.",
        fields: [
          {
            code: "capitulos_1_a_9",
            label: "Capitulos 1 a 9",
            type: "textarea",
            required: true,
            helpText: "Escreva os capitulos de Historia, Cultura, Contexto, Proposta de Valor, Portfolio, Mercado, ICP, Comercial e Marketing.",
            acceptanceCriteria: "Todos os capitulos obrigatorios com conteudo substantivo.",
            sourceReference: "MANUAL_METODOLOGICO_IMERSAO - Secao 10"
          }
        ]
      }
    ]
  },
  {
    code: "FORMULARIO_CONSOLIDADO_CAMADA1",
    name: "Diagnostico Camada 1",
    stage: "D",
    visibility: "internal",
    description: "Maturidade estrutural do marketing com 10 blocos e regras de bloqueio.",
    sections: [
      {
        code: "scores_bloco",
        title: "Notas dos 10 Blocos",
        description: "Notas de 1 a 4 para cada bloco da Camada 1.",
        fields: [
          {
            code: "block_scores",
            label: "Notas por Bloco (JSON)",
            type: "json",
            required: true,
            helpText:
              "Informe JSON com chaves block1..block10 e valores de 1 a 4. Exemplo: {\"block1\":2,\"block2\":2,...,\"block10\":1}.",
            acceptanceCriteria: "10 blocos preenchidos com notas validas.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA1 - Blocos 1 a 10"
          },
          {
            code: "has_all_essential_assets",
            label: "Ativos Essenciais Institucionalizados",
            type: "checkbox",
            required: true,
            helpText: "Marque se os itens essenciais de governanca de ativos foram atendidos.",
            acceptanceCriteria: "Obrigatorio para classificacao Estruturado.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA1 - Bloco 8"
          },
          {
            code: "has_registro_marca_concedido",
            label: "Registro de Marca Concedido",
            type: "checkbox",
            required: true,
            helpText: "Marque quando a marca estiver concedida (nao apenas protocolada).",
            acceptanceCriteria: "Obrigatorio para classificacao Estrategico.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA1 - Criterios obrigatorios"
          },
          {
            code: "has_governanca_ativos_formal",
            label: "Governanca Formal de Ativos",
            type: "checkbox",
            required: true,
            helpText: "Marque quando politicas formais de governanca e controle estiverem implementadas.",
            acceptanceCriteria: "Obrigatorio para classificacao Estrategico.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA1 - Criterios obrigatorios"
          }
        ]
      }
    ]
  },
  {
    code: "FORMULARIO_CONSOLIDADO_CAMADA2",
    name: "Diagnostico Camada 2",
    stage: "D",
    visibility: "internal",
    description: "Avaliacao real do marketing com 28 blocos e regras de bloqueio.",
    sections: [
      {
        code: "scores_blocos_c2",
        title: "Notas dos 28 Blocos",
        description: "Notas de 1 a 4 para cada bloco dos eixos E1..E8.",
        fields: [
          {
            code: "block_scores_c2",
            label: "Notas C2 (JSON)",
            type: "json",
            required: true,
            helpText:
              "Informe JSON com chaves e1b1..e8b3 (28 blocos), valores de 1 a 4. Exemplo: {\"e1b1\":2,\"e1b2\":3,...}.",
            acceptanceCriteria: "Todos os 28 blocos preenchidos com notas validas.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA2 - Quadro de Notas"
          },
          {
            code: "outbound_is_strategic",
            label: "Outbound Faz Parte da Estrategia Ideal",
            type: "checkbox",
            required: true,
            helpText:
              "Se false, ausencia de outbound nao bloqueia maturidade e o bloco E8B3 pode ser tratado como nao aplicavel.",
            acceptanceCriteria: "Definicao explicita do papel de outbound no contexto da empresa.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA2 - E8B3 criterio absoluto"
          }
        ]
      }
    ]
  },
  {
    code: "TEMPLATE_RELATORIO_CLIENTE_DIAGNOSTICO",
    name: "Relatorio Cliente - Diagnostico",
    stage: "D",
    visibility: "client",
    description: "Consolidacao executiva das duas camadas, matriz cruzada e proximos passos.",
    sections: [
      {
        code: "visao_integrada",
        title: "Visao Integrada e Causa-Efeito",
        description: "Narrativa com matriz cruzada e conexoes entre camada estrutural e pratica.",
        fields: [
          {
            code: "sumario_diagnostico",
            label: "Sumario Executivo",
            type: "textarea",
            required: true,
            helpText: "Descreva classificacao das camadas, 3-4 achados e implicacoes para o negocio.",
            acceptanceCriteria: "Resumo executivo claro e acionavel.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_DIAGNOSTICO - Sumario"
          },
          {
            code: "conexoes_causa_efeito",
            label: "Conexoes Causa-Efeito",
            type: "textarea",
            required: true,
            helpText: "Registrar de 3 a 5 conexoes causa (Camada 1) -> efeito (Camada 2) com implicacao.",
            acceptanceCriteria: "Minimo de 3 conexoes com impacto explicito.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_DIAGNOSTICO - Cap. 2.3"
          }
        ]
      }
    ]
  },
  {
    code: "FORMULARIO_ESTRUTURA",
    name: "Formulario Estrutura",
    stage: "E",
    visibility: "internal",
    description: "Mapeamento atual x ideal e recomendacoes por equipe, documentos, tecnologia, integracoes e rastreamentos.",
    sections: [
      {
        code: "dimensoes",
        title: "5 Dimensoes de Estrutura",
        description: "Preencher cenario atual, ideal, gaps e recomendacoes por dimensao.",
        fields: [
          {
            code: "equipe",
            label: "Equipe (Atual, Gaps, Recomendacao)",
            type: "textarea",
            required: true,
            helpText: "Mapeie pessoas, funcoes, dedicacao, lacunas de competencia e recomendacao por cenario.",
            acceptanceCriteria: "Cenarios minimo/recomendado/ideal definidos para equipe.",
            sourceReference: "FORMULARIO_ESTRUTURA - Dimensao 1"
          },
          {
            code: "documentos",
            label: "Documentos (Atual, Gaps, Recomendacao)",
            type: "textarea",
            required: true,
            helpText: "Mapeie documentos existentes, desatualizados e prioridades de criacao.",
            acceptanceCriteria: "Priorizacao de criacao com 5 itens minimos.",
            sourceReference: "FORMULARIO_ESTRUTURA - Dimensao 2"
          },
          {
            code: "tecnologia",
            label: "Tecnologia (Atual, Gaps, Recomendacao)",
            type: "textarea",
            required: true,
            helpText: "Mapeie stack atual, lacunas de ferramenta/configuracao/uso e recomendacoes por cenario.",
            acceptanceCriteria: "Stack recomendado com investimento estimado.",
            sourceReference: "FORMULARIO_ESTRUTURA - Dimensao 3"
          },
          {
            code: "integracoes",
            label: "Integracoes (Atual, Gaps, Recomendacao)",
            type: "textarea",
            required: true,
            helpText: "Descrever fluxo de dados atual e integracoes criticas ausentes.",
            acceptanceCriteria: "Mapa de prioridades de integracao definido.",
            sourceReference: "FORMULARIO_ESTRUTURA - Dimensao 4"
          },
          {
            code: "rastreamentos",
            label: "Rastreamentos (Atual, Gaps, Recomendacao)",
            type: "textarea",
            required: true,
            helpText: "Registrar status de analytics, pixels, eventos, UTM e atribuicao.",
            acceptanceCriteria: "Plano minimo/recomendado/ideal de tracking descrito.",
            sourceReference: "FORMULARIO_ESTRUTURA - Dimensao 5"
          }
        ]
      }
    ]
  },
  {
    code: "TEMPLATE_RELATORIO_CLIENTE_ESTRUTURA",
    name: "Relatorio Cliente - Estrutura",
    stage: "E",
    visibility: "client",
    description: "Relatorio apresentavel com dashboard de gaps, cenarios e investimento.",
    sections: [
      {
        code: "dashboard_estrutura",
        title: "Dashboard e Priorizacao",
        description: "Status por dimensao, top 10 acoes e cronograma sugerido.",
        fields: [
          {
            code: "sumario_estrutura",
            label: "Sumario Executivo",
            type: "textarea",
            required: true,
            helpText: "Sintese das 5 dimensoes, principais gaps e caminho recomendado.",
            acceptanceCriteria: "Cliente compreende o que precisa construir e em que ordem.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_ESTRUTURA - Sumario"
          },
          {
            code: "top10_acoes",
            label: "Top 10 Acoes Priorizadas",
            type: "textarea",
            required: true,
            helpText: "Liste 10 acoes com dimensao, impacto e urgencia.",
            acceptanceCriteria: "Lista priorizada 1..10 com impacto/urgencia.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_ESTRUTURA - Cap. 7.1"
          }
        ]
      }
    ]
  },
  {
    code: "FORMULARIO_ARQUITETURA",
    name: "Formulario Arquitetura",
    stage: "A",
    visibility: "internal",
    description: "Plano de acao por fases com premissas, KPIs, verba e modelo de execucao.",
    sections: [
      {
        code: "premissas_recomendacoes",
        title: "Premissas e Recomendacoes",
        description: "Consolidar premissas da imersao/diagnostico e diretrizes do plano.",
        fields: [
          {
            code: "premissas_consolidadas",
            label: "Premissas Consolidadas",
            type: "textarea",
            required: true,
            helpText: "Liste premissas com origem rastreavel e impacto no plano.",
            acceptanceCriteria: "Premissas essenciais documentadas com impacto.",
            sourceReference: "FORMULARIO_ARQUITETURA - Bloco 1.1"
          },
          {
            code: "recomendacoes_estrategicas",
            label: "Recomendacoes Estrategicas",
            type: "textarea",
            required: true,
            helpText: "Diretrizes macro derivadas dos achados das etapas anteriores.",
            acceptanceCriteria: "Recomendacoes priorizadas e coerentes com maturidade.",
            sourceReference: "FORMULARIO_ARQUITETURA - Bloco 1.2"
          }
        ]
      },
      {
        code: "plano_fases",
        title: "Plano por Fases",
        description: "Acoes por fase com responsavel, prazo, entregavel e dependencia.",
        fields: [
          {
            code: "fases_planejadas",
            label: "Fases Planejadas",
            type: "textarea",
            required: true,
            helpText: "Descreva fases Fundacao, Construcao, Expansao, Otimizacao (e opcional Fase 5).",
            acceptanceCriteria: "Cada fase com objetivo, duracao e criterio de conclusao.",
            sourceReference: "MANUAL_METODOLOGICO_ARQUITETURA - Secao 3"
          },
          {
            code: "acoes_priorizadas",
            label: "Acoes Priorizadas",
            type: "textarea",
            required: true,
            helpText: "Registre acoes com origem do achado, responsavel, prazo e entregavel.",
            acceptanceCriteria: "Plano acionavel por fase com rastreabilidade de origem.",
            sourceReference: "FORMULARIO_ARQUITETURA - Bloco 2"
          }
        ]
      },
      {
        code: "kpis_verba_execucao",
        title: "KPIs, Verba e Modelo de Execucao",
        description: "Definir dashboard, verba recomendada e papeis de execucao.",
        fields: [
          {
            code: "kpis_dashboard",
            label: "Dashboard de KPIs",
            type: "textarea",
            required: true,
            helpText: "Defina KPIs estrategicos, taticos, operacionais e de evolucao de maturidade.",
            acceptanceCriteria: "KPIs com baseline, meta, frequencia e responsavel.",
            sourceReference: "FORMULARIO_ARQUITETURA - Bloco 3"
          },
          {
            code: "verba_recomendada",
            label: "Verba Recomendada",
            type: "textarea",
            required: true,
            helpText: "Informar range minimo-maximo, ponto recomendado e distribuicao por categoria.",
            acceptanceCriteria: "Range coerente com faturamento, maturidade e estrutura escolhida.",
            sourceReference: "FORMULARIO_ARQUITETURA - Bloco 4"
          },
          {
            code: "modelo_execucao",
            label: "Modelo de Execucao",
            type: "select",
            required: true,
            options: [
              { value: "mkt_real", label: "MKT Real executa" },
              { value: "cliente", label: "Cliente executa" },
              { value: "hibrido", label: "Hibrido" }
            ],
            helpText: "Defina quem executa e como ocorre o alinhamento operacional e estrategico.",
            acceptanceCriteria: "Modelo definido com responsabilidades claras.",
            sourceReference: "FORMULARIO_ARQUITETURA - Bloco 5"
          }
        ]
      }
    ]
  },
  {
    code: "TEMPLATE_RELATORIO_CLIENTE_ARQUITETURA",
    name: "Relatorio Cliente - Arquitetura",
    stage: "A",
    visibility: "client",
    description: "Plano de acao estrategico apresentavel ao cliente.",
    sections: [
      {
        code: "resumo_plano",
        title: "Resumo do Plano",
        description: "Resumo executivo com ponto de partida, horizonte, fases e investimento.",
        fields: [
          {
            code: "sumario_plano",
            label: "Sumario Executivo",
            type: "textarea",
            required: true,
            helpText: "Resuma cenario de partida, objetivo, fases, frentes e range de investimento.",
            acceptanceCriteria: "Resumo de 1 pagina com clareza de caminho.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_ARQUITETURA - Sumario"
          }
        ]
      }
    ]
  },
  {
    code: "FORMULARIO_LOOP",
    name: "Formulario Loop",
    stage: "L",
    visibility: "internal",
    description: "Operacao do loop com calendario, reviews, marcos de aprendizado e rediagnosticos.",
    sections: [
      {
        code: "config_calendario",
        title: "Configuracao e Calendario do Loop",
        description: "Definir frequencia dos rituais e agenda do ciclo.",
        fields: [
          {
            code: "config_loop",
            label: "Configuracao do Loop",
            type: "textarea",
            required: true,
            helpText: "Defina frequencias de rituais, horizonte, fases e modelo de execucao.",
            acceptanceCriteria: "Frequencias e horizonte definidos com datas base.",
            sourceReference: "FORMULARIO_LOOP - Secao 1"
          },
          {
            code: "calendario_12m",
            label: "Calendario do Loop (12 meses)",
            type: "textarea",
            required: true,
            helpText: "Registrar agenda de alinhamentos, reviews, marcos e rediagnosticos.",
            acceptanceCriteria: "Calendario preenchido para o periodo do projeto.",
            sourceReference: "MANUAL_METODOLOGICO_LOOP - Secao 6"
          }
        ]
      },
      {
        code: "operacao_aprendizado",
        title: "Operacao e Aprendizado",
        description: "Registro de KPIs, reviews de fase, marcos e rediagnosticos.",
        fields: [
          {
            code: "reviews_kpi",
            label: "Reviews de KPI",
            type: "textarea",
            required: true,
            helpText: "Registrar leitura de KPI, tendencias, decisoes e ajustes recorrentes.",
            acceptanceCriteria: "Ao menos um ciclo de review mensal registrado.",
            sourceReference: "FORMULARIO_LOOP - Secao 3"
          },
          {
            code: "marcos_aprendizado",
            label: "Marcos de Aprendizado",
            type: "textarea",
            required: true,
            helpText: "Documentar o que funcionou, o que nao funcionou, aprendizado e ajustes.",
            acceptanceCriteria: "Marcos com licoes e ajustes concretos.",
            sourceReference: "MANUAL_METODOLOGICO_LOOP - Secao 5"
          },
          {
            code: "rediagnosticos",
            label: "Controle de Rediagnosticos",
            type: "textarea",
            required: true,
            helpText: "Comparar antes x depois nas camadas e atualizar matriz de maturidade cruzada.",
            acceptanceCriteria: "Comparativos registrados para periodos executados.",
            sourceReference: "FORMULARIO_LOOP - Secao 6"
          }
        ]
      }
    ]
  },
  {
    code: "TEMPLATE_RELATORIO_CLIENTE_LOOP",
    name: "Relatorio Cliente - Loop",
    stage: "L",
    visibility: "client",
    description: "Relatorio inicial do sistema de acompanhamento e relatorios periodicos de evolucao.",
    sections: [
      {
        code: "relatorio_inicial_loop",
        title: "Relatorio Inicial do Loop",
        description: "Apresentar sistema, calendario, KPIs e agenda de rediagnosticos.",
        fields: [
          {
            code: "sumario_loop_inicial",
            label: "Sumario Inicial do Loop",
            type: "textarea",
            required: true,
            helpText: "Explicar funcionamento do loop e o sistema de acompanhamento em linguagem executiva.",
            acceptanceCriteria: "Cliente compreende ritos, calendario e regras de evolucao.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_LOOP - Parte A"
          }
        ]
      },
      {
        code: "relatorio_evolucao_loop",
        title: "Relatorio Periodico de Evolucao",
        description: "Comparativos de maturidade, KPIs, licoes e ajustes de plano.",
        fields: [
          {
            code: "sumario_evolucao",
            label: "Sumario de Evolucao",
            type: "textarea",
            required: true,
            helpText: "Registrar evolucao comparativa de camadas, matriz cruzada e proximos ajustes.",
            acceptanceCriteria: "Relatorio evidencia progresso real e pontos de estagnacao.",
            sourceReference: "TEMPLATE_RELATORIO_CLIENTE_LOOP - Parte B"
          }
        ]
      }
    ]
  }
];

export const methodologyStages = Object.entries(stageLabel).map(([code, name]) => ({
  code: code as MethodologyStageCode,
  name
}));

export const stageStatusOptions = statusOptions;

export function getArtifactsByStage(stage: MethodologyStageCode) {
  return methodologyArtifacts.filter((artifact) => artifact.stage === stage);
}

export function getArtifactByCode(stage: MethodologyStageCode, artifactCode: string) {
  return methodologyArtifacts.find((artifact) => artifact.stage === stage && artifact.code === artifactCode);
}
