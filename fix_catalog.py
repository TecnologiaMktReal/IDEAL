import re

path = 'apps/api/src/modules/methodology/catalog.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_snippet = """          {
            code: "tecnologia",
            label: "Tecnologia (Atual, Gaps, Recomendacao)",
    sections: ["""

good_snippet = """          {
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
          },
          {
            code: "evidencias_arquivos",
            label: "Anexos e Documentos Visuais",
            type: "file",
            required: false,
            helpText: "Documentos de apoio, organogramas, exportacoes analytics, etc.",
            acceptanceCriteria: "Opcional.",
            sourceReference: "FORMULARIO_ESTRUTURA - Evidencias"
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
    sections: ["""

new_content = content.replace(bad_snippet, good_snippet)
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Fix catalog status: Changed =", "tecnologia" in good_snippet and bad_snippet not in new_content)
