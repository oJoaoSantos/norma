import { getLegislacaoMunicipal, getLegislacaoNacional } from "@/lib/db/legislacao";
import type { MemoriaInput } from "../schemas/memoria";
import { NATUREZA_PREDIO_OPTIONS, TIPO_OBRA_OPTIONS } from "../schemas/memoria";
import { EXEMPLO_REFERENCIA } from "./exemplo-referencia";

const TIPO_OBRA_LABEL = Object.fromEntries(
  TIPO_OBRA_OPTIONS.map((o) => [o.value, o.label]),
) as Record<MemoriaInput["tipoObra"], string>;

const NATUREZA_PREDIO_LABEL = Object.fromEntries(
  NATUREZA_PREDIO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<MemoriaInput["naturezaPredio"], string>;

/**
 * Estrutura calibrada a partir de uma Memória Descritiva e Justificativa
 * real aprovada (ver exemplo-referencia.ts). "Quadro Sinótico e Quadro de
 * Áreas" NÃO faz parte desta lista — é gerado à parte de forma
 * determinística (ver buildQuadroSinotico) para nunca inventar números.
 */
export const ESTRUTURA_DOCUMENTO = [
  "Área Objeto do Pedido e Descrição do Contexto Territorial",
  "Caracterização da Operação Urbanística",
  "Enquadramento da Pretensão nos Planos Territoriais",
  "Opções Técnicas, Integração Urbana e Paisagística",
  "Condicionantes de Relacionamento Formal e Funcional com a Envolvente",
  "Utilização da Edificação",
  "Notas Finais",
];

/** Subtítulos técnicos usados dentro de "Opções Técnicas..." — renderizados como Heading2 no .docx. */
export const SUBSECCOES_OPCOES_TECNICAS = [
  "Fundações",
  "Estrutura",
  "Pavimentos",
  "Cobertura",
  "Paredes Exteriores",
  "Paredes Interiores",
  "Rede de Águas",
  "Rede de Esgotos",
  "Revestimentos",
  "Caixilharia/Carpintaria",
  "Infraestruturas",
];

export const QUADRO_SINOTICO_TITULO = "Quadro Sinótico e Quadro de Áreas";

export async function buildSystemPrompt(concelho: string): Promise<string> {
  const [nacional, municipal] = await Promise.all([
    getLegislacaoNacional(),
    getLegislacaoMunicipal(concelho),
  ]);

  const blocoMunicipal =
    municipal ??
    `Não há legislação municipal (PDM) registada para "${concelho}" nesta
aplicação. Não inventes índices urbanísticos, cércea máxima por zona,
afastamentos ou qualquer outro parâmetro específico deste concelho — usa
apenas os dados fornecidos pelo utilizador e a base legal nacional abaixo.`;

  const blocoNacional =
    nacional ??
    `Não há base legal nacional registada nesta aplicação. Não inventes
números de artigo — refere o RJUE (Decreto-Lei n.º 555/99) e o RGEU
(Decreto-Lei n.º 38382) apenas pelo nome.`;

  return `
És um assistente que redige Memórias Descritivas e Justificativas para
processos de licenciamento/comunicação prévia em Câmaras Municipais
portuguesas, no âmbito do RJUE (Decreto-Lei n.º 555/99). O teu padrão de
qualidade é o de um arquiteto português sénior a escrever para uma Câmara
Municipal — técnico, formal, denso, nunca genérico ou vago. Varia o
vocabulário e a construção frásica entre secções (evita repetir as mesmas
fórmulas/frases feitas de secção para secção); cada secção deve ler-se como
escrita com atenção ao caso concreto, não como preenchimento de um molde.
Isto aplica-se só à qualidade da prosa — nunca à exatidão factual: as
regras abaixo sobre não inventar números, citações ou dados continuam a
aplicar-se integralmente.

MODELO DE REFERÊNCIA (estrutura e tom de uma memória real aprovada — os
dados deste modelo são fictícios, serve APENAS de referência de estilo e
profundidade; nunca reutilizes nomes, moradas, números ou factos deste
modelo no documento que vais gerar):
${EXEMPLO_REFERENCIA}

Regras obrigatórias:
- Estrutura o documento exatamente nestas secções, por esta ordem: ${ESTRUTURA_DOCUMENTO.join(", ")}.
- Na secção "Área Objeto do Pedido e Descrição do Contexto Territorial", usa
  sempre os dados legais concretos fornecidos pelo utilizador — NIF do
  requerente, morada do requerente, natureza do prédio, número de registo
  predial, área do terreno, confrontações a Norte/Sul/Nascente/Poente.
  Nunca escrevas "indicado no processo" ou equivalente quando o dado te foi
  dado explicitamente — usa o valor real.
- Na secção "Utilização da Edificação", se for fornecida uma lista de
  compartimentos, descreve o programa funcional com base nela; caso
  contrário, mantém a descrição genérica de acordo com o tipo de obra.
- Na secção "Condicionantes de Relacionamento Formal e Funcional com a
  Envolvente", se for fornecido um texto de "Enquadramento da envolvente",
  usa-o como base concreta da secção (características da zona, tipologia
  predominante, infraestruturas existentes, etc.) em vez de escreveres em
  termos genéricos — mas não inventes nenhum facto sobre a envolvente que
  não esteja nesse texto ou nos restantes dados fornecidos. Se não for
  fornecido, mantém a descrição genérica adequada ao tipo de obra e à
  natureza do prédio, tal como fazias até agora.
- Na secção "Opções Técnicas, Integração Urbana e Paisagística", usa
  subtítulos próprios (cada um sozinho na sua linha, sem markdown) para
  cada elemento construtivo, nesta ordem: ${SUBSECCOES_OPCOES_TECNICAS.join(", ")}.
  Para os elementos em que os dados fornecidos pelo utilizador dão
  informação concreta (materiais, revestimentos, isolamento), usa essa
  informação. Para os restantes elementos (ex: Fundações, Estrutura,
  Pavimentos, redes), escreve em termos genéricos e correntes para este
  tipo de obra, remetendo explicitamente para os "projetos de
  especialidade a apresentar" — tal como no modelo de referência. Nunca
  inventes marcas, espessuras ou soluções técnicas específicas que não
  foram fornecidas.
- Cita APENAS a legislação fornecida nos blocos "LEGISLAÇÃO NACIONAL" e
  "LEGISLAÇÃO MUNICIPAL" abaixo. Nunca inventes números de artigo, diplomas,
  índices ou percentagens que não estejam explicitamente nesses blocos — se
  não cobrirem algo, escreve o texto de forma genérica em vez de inventar
  uma citação.
- Usa sempre o nome do concelho e da freguesia exatamente como fornecidos;
  nunca menciones outro concelho.
- Não incluas comentários fora do texto do documento (sem "aqui está a
  memória descritiva:" nem notas finais fora da secção "Notas Finais").
- Texto simples, sem markdown (sem "**", "#", "-" de listas nem qualquer
  outra sintaxe de formatação) — cada título de secção ou subtítulo fica
  sozinho na sua própria linha, escrito exatamente como aparece nas listas
  acima.
- Não repitas o título "Memória Descritiva e Justificativa" no corpo do
  texto — começa diretamente pela secção "Área Objeto do Pedido e
  Descrição do Contexto Territorial".
- Não escrevas a secção "${QUADRO_SINOTICO_TITULO}" — essa secção é gerada
  separadamente pela aplicação a partir dos dados exatos, para não haver
  risco de erro nos números.

LEGISLAÇÃO NACIONAL (aplicável a todos os concelhos):
${blocoNacional}

LEGISLAÇÃO MUNICIPAL (${concelho}):
${blocoMunicipal}
`.trim();
}

export function buildUserPrompt(
  data: MemoriaInput,
  tecnico: { nome: string; numeroOrdem: string },
): string {
  const compartimentosTexto =
    data.compartimentos.length > 0
      ? data.compartimentos.map((c) => `- ${c.nome}: ${c.area} m²`).join("\n")
      : null;

  return `
Gera a Memória Descritiva e Justificativa com os seguintes dados:

Requerente: ${data.requerenteNome}
NIF do requerente: ${data.requerenteNif}
Morada do requerente: ${data.requerenteMorada}
Técnico responsável: ${tecnico.nome} (n.º de ordem ${tecnico.numeroOrdem})

Localização e identificação predial:
- Concelho: ${data.concelho}
- Freguesia: ${data.freguesia}
- Morada da obra: ${data.morada}
- Artigo matricial: ${data.artigoMatricial}
- Natureza do prédio: ${NATUREZA_PREDIO_LABEL[data.naturezaPredio]}
- N.º de registo predial: ${data.numeroRegistoPredial}

Terreno e confrontações:
- Área do terreno: ${data.areaTerreno} m²
- Confrontação Norte: ${data.confrontacaoNorte}
- Confrontação Sul: ${data.confrontacaoSul}
- Confrontação Nascente: ${data.confrontacaoNascente}
- Confrontação Poente: ${data.confrontacaoPoente}
${data.enquadramentoEnvolvente ? `\nEnquadramento da envolvente:\n${data.enquadramentoEnvolvente}` : ""}

Tipo de obra: ${TIPO_OBRA_LABEL[data.tipoObra]}

Parâmetros urbanísticos:
- Área total de construção: ${data.areaTotalConstrucao} m²
- Área de implantação: ${data.areaImplantacao} m²
- Cércea: ${data.cerceaMetros} m
- Número de pisos: ${data.numeroPisos}
${data.volumeMetrosCubicos ? `- Volume: ${data.volumeMetrosCubicos} m³` : ""}
${data.numeroEstacionamentos ? `- N.º de estacionamentos: ${data.numeroEstacionamentos}` : ""}

Materiais e acabamentos:
- Revestimento de fachada: ${data.revestimentoFachada}
- Caixilharia: ${data.caixilharia}
- Isolamento térmico/acústico: ${data.isolamentoTermicoAcustico}
${compartimentosTexto ? `\nCompartimentos:\n${compartimentosTexto}` : ""}
`.trim();
}

export interface QuadroSinotico {
  titulo: string;
  /** Pares [label, valor] — uma linha por indicador. */
  linhas: [string, string][];
  /** Pares [compartimento, área] — vazio se não houver compartimentos. */
  quadroAreas: [string, string][];
}

/**
 * Secção "Quadro Sinótico e Quadro de Áreas" construída de forma
 * determinística a partir dos dados reais — nunca passa pelo LLM nem fica
 * embutida no texto editável, para que os números nunca possam ser
 * inventados na geração nem alterados sem querer na edição. Devolve dados
 * estruturados; quem chama decide como representar (o exportador docx
 * gera uma tabela real a partir disto — ver build-memoria.ts). Os índices
 * urbanísticos são calculados diretamente a partir da área do terreno;
 * indicadores que continuam a não ser recolhidos (cota de soleira, área de
 * impermeabilização, n.º de estacionamentos) ficam explicitamente marcados
 * como não preenchidos quando o utilizador não os fornece.
 */
export function buildQuadroSinotico(data: MemoriaInput): QuadroSinotico {
  const indiceOcupacao = data.areaImplantacao / data.areaTerreno;
  const indiceUtilizacao = data.areaTotalConstrucao / data.areaTerreno;

  const linhas: [string, string][] = [
    ["Área do terreno", `${data.areaTerreno} m²`],
    ["Área total de implantação", `${data.areaImplantacao} m²`],
    ["Área total de construção", `${data.areaTotalConstrucao} m²`],
    ["Cércea", `${data.cerceaMetros} m`],
    ["Pisos acima da cota de soleira", `${data.numeroPisos}`],
    ...(data.volumeMetrosCubicos != null
      ? ([["Volumetria", `${data.volumeMetrosCubicos} m³`]] as [string, string][])
      : []),
    ["Índice de ocupação do solo", indiceOcupacao.toFixed(2)],
    ["Índice de utilização do solo", indiceUtilizacao.toFixed(2)],
    [
      "N.º de estacionamentos",
      data.numeroEstacionamentos != null ? String(data.numeroEstacionamentos) : "por preencher",
    ],
    ["Cota de soleira", data.cotaSoleira != null ? String(data.cotaSoleira) : "por preencher"],
    [
      "Área de impermeabilização",
      data.areaImpermeabilizacao != null ? String(data.areaImpermeabilizacao) : "por preencher",
    ],
  ];

  const quadroAreas: [string, string][] = data.compartimentos.map((c) => [
    c.nome,
    `${c.area} m²`,
  ]);

  return { titulo: QUADRO_SINOTICO_TITULO, linhas, quadroAreas };
}
