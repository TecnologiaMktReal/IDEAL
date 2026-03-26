const fs = require('fs');

const catalogPath = './apps/api/src/modules/methodology/catalog.ts';
let catalog = fs.readFileSync(catalogPath, 'utf8');

const c1Titles = [
  'Mentalidade Estratégica da Liderança', 'Engajamento Organizacional', 'Autonomia e Estrutura Decisória',
  'Cultura Orçamentária e Investimento', 'Cultura de Planejamento e Alinhamento', 'Estrutura e Processos',
  'Integração Intersetorial com Vendas', 'Governança de Ativos Institucionais', 'Capacidade Técnica',
  'Cultura de Análise de Dados'
];

let c1Fields = c1Titles.map((title, i) => `          {
            code: "block${i+1}",
            label: "Bloco ${i+1} — ${title}",
            type: "select",
            required: true,
            options: [
              { value: "1", label: "Reativo (1)" },
              { value: "2", label: "Operacional (2)" },
              { value: "3", label: "Estruturado (3)" },
              { value: "4", label: "Estratégico (4)" }
            ],
            helpText: "Score avaliado pelo consultor (1 a 4).",
            acceptanceCriteria: "Obrigatório.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA1 - Bloco ${i+1}"
          }`).join(',\n');

let c2FieldsArr = [];
const axes = [3, 4, 3, 4, 3, 4, 4, 3];
for(let ax=1; ax<=8; ax++) {
    for(let b=1; b<=axes[ax-1]; b++) {
        c2FieldsArr.push(`          {
            code: "e${ax}b${b}",
            label: "Eixo ${ax} Bloco ${b}",
            type: "select",
            required: true,
            options: [
              { value: "1", label: "Reativo (1)" },
              { value: "2", label: "Operacional (2)" },
              { value: "3", label: "Estruturado (3)" },
              { value: "4", label: "Estratégico (4)" }
            ],
            helpText: "Score avaliado para Eixo ${ax} Bloco ${b} (1 a 4).",
            acceptanceCriteria: "Obrigatório.",
            sourceReference: "FORMULARIO_CONSOLIDADO_CAMADA2"
          }`);
    }
}
let c2Fields = c2FieldsArr.join(',\n');

// RASTREAMENTO NO CATALOG.TS
// Para Camada 1, vamos substituir a definicao de block_scores
const regexC1 = /\{\s*code:\s*"block_scores"[\s\S]*?sourceReference:\s*"FORMULARIO_CONSOLIDADO_CAMADA1 - Blocos 1 a 10"\s*\},?/;
catalog = catalog.replace(regexC1, c1Fields + ',');

// Para Camada 2, substituir block_scores_c2
const regexC2 = /\{\s*code:\s*"block_scores_c2"[\s\S]*?sourceReference:\s*"FORMULARIO_CONSOLIDADO_CAMADA2 - Quadro de Notas"\s*\},?/;
catalog = catalog.replace(regexC2, c2Fields + ',');

fs.writeFileSync(catalogPath, catalog);
console.log('Catalog updated successfully with 10 C1 fields and 28 C2 fields.');
