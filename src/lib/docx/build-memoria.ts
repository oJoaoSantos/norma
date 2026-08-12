import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  PageBreak,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  WidthType,
  type FileChild,
} from "docx";
import { memoriaToInput } from "@/lib/db/mappers";
import type { MemoriaDescritiva } from "@/lib/db/schema";
import {
  buildQuadroSinotico,
  ESTRUTURA_DOCUMENTO,
  QUADRO_SINOTICO_TITULO,
  SUBSECCOES_OPCOES_TECNICAS,
  type QuadroSinotico,
} from "@/lib/prompt";

const DOCUMENT_TITLE = "Memória Descritiva e Justificativa";

const SECTION_TITLES = ESTRUTURA_DOCUMENTO.map((t) => t.toLowerCase());
const SUBSECTION_TITLES = SUBSECCOES_OPCOES_TECNICAS.map((t) => t.toLowerCase());
const QUADRO_SINOTICO_TITULO_LOWER = QUADRO_SINOTICO_TITULO.toLowerCase();

const LINE_SPACING: Record<string, number> = {
  simples: 240,
  media: 360,
  duplo: 480,
};

export interface LayoutConfig {
  fonte: string;
  tamanhoPt: number;
  espacamento: "simples" | "media" | "duplo";
  alinhamento: "esquerda" | "justificado";
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  fonte: "Times New Roman",
  tamanhoPt: 11,
  espacamento: "simples",
  alinhamento: "justificado",
};

/**
 * Modelos pequenos (ex: llama3.1:8b local) nem sempre respeitam a instrução
 * de "sem markdown" do prompt — isto neutraliza `**negrito**`, `# títulos`
 * e bullets `- `/`* ` para que não apareçam como asteriscos literais no Word.
 */
function stripMarkdown(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*]\s+/, "• ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .trim();
}

function normalizeHeadingLine(line: string): string {
  return line.toLowerCase().replace(/^\d+[.)]\s*/, "");
}

function isSectionHeading(line: string): boolean {
  return SECTION_TITLES.includes(normalizeHeadingLine(line));
}

function isSubsectionHeading(line: string): boolean {
  return SUBSECTION_TITLES.includes(normalizeHeadingLine(line));
}

function isQuadroSinoticoHeading(line: string): boolean {
  return normalizeHeadingLine(line) === QUADRO_SINOTICO_TITULO_LOWER;
}

function buildCoverPage(meta: MemoriaDescritiva): Paragraph[] {
  return [
    new Paragraph({
      text: DOCUMENT_TITLE,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 800 },
    }),
    new Paragraph({
      text: `Concelho: ${meta.concelho} — Freguesia: ${meta.freguesia}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Morada da obra: ${meta.morada}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Requerente: ${meta.requerenteNome}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Técnico responsável: ${meta.tecnicoNome} (n.º ${meta.tecnicoNumeroOrdem})`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: new Date().toLocaleDateString("pt-PT"),
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function buildIndice(): FileChild[] {
  return [
    new Paragraph({ text: "Índice", heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      text: '(No Word, atualiza este índice: clique direito sobre ele → "Atualizar campo", ou tecla F9.)',
      style: "IndiceNota",
    }),
    new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function twoColumnTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, valor]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: label })],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: valor })],
            }),
          ],
        }),
    ),
  });
}

function buildQuadroSinoticoSection(quadro: QuadroSinotico): FileChild[] {
  const children: FileChild[] = [
    new Paragraph({ text: quadro.titulo, heading: HeadingLevel.HEADING_1 }),
    twoColumnTable(quadro.linhas),
  ];

  if (quadro.quadroAreas.length > 0) {
    children.push(
      new Paragraph({
        text: "Quadro de Áreas",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      }),
      twoColumnTable(quadro.quadroAreas),
    );
  }

  return children;
}

export async function buildMemoriaDocx(
  meta: MemoriaDescritiva,
  text: string,
  layout: LayoutConfig = DEFAULT_LAYOUT,
): Promise<Buffer> {
  const children: FileChild[] = [...buildCoverPage(meta), ...buildIndice()];

  let sawFirstLine = false;

  for (const rawLine of text.split("\n")) {
    const line = stripMarkdown(rawLine);

    if (!line) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }

    if (!sawFirstLine) {
      sawFirstLine = true;
      if (line.toLowerCase() === DOCUMENT_TITLE.toLowerCase()) continue;
    }

    // Textos gerados antes desta versão ainda trazem o Quadro Sinótico
    // embutido como texto simples no fim — a partir daqui é sempre
    // reconstruído como tabela (ver abaixo), por isso o resto do texto
    // livre é ignorado a partir deste ponto.
    if (isQuadroSinoticoHeading(line)) break;

    let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
    if (isSectionHeading(line)) heading = HeadingLevel.HEADING_1;
    else if (isSubsectionHeading(line)) heading = HeadingLevel.HEADING_2;

    children.push(new Paragraph(heading ? { text: line, heading } : { text: line }));
  }

  children.push(...buildQuadroSinoticoSection(buildQuadroSinotico(memoriaToInput(meta))));

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: layout.fonte,
            size: layout.tamanhoPt * 2, // docx usa meio-pontos
          },
          paragraph: {
            alignment:
              layout.alinhamento === "justificado"
                ? AlignmentType.JUSTIFIED
                : AlignmentType.LEFT,
            spacing: {
              line: LINE_SPACING[layout.espacamento],
              lineRule: "auto",
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: "IndiceNota",
          name: "Índice Nota",
          basedOn: "Normal",
          run: { italics: true, size: (layout.tamanhoPt - 1) * 2 },
        },
      ],
    },
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}
