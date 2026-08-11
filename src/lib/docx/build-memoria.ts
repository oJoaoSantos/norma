import { AlignmentType, Document, HeadingLevel, Packer, Paragraph } from "docx";
import type { MemoriaDescritiva } from "@/lib/db/schema";
import {
  ESTRUTURA_DOCUMENTO,
  QUADRO_SINOTICO_TITULO,
  SUBSECCOES_OPCOES_TECNICAS,
} from "@/lib/prompt";

const DOCUMENT_TITLE = "Memória Descritiva e Justificativa";

const SECTION_TITLES = [...ESTRUTURA_DOCUMENTO, QUADRO_SINOTICO_TITULO].map((t) =>
  t.toLowerCase(),
);

const SUBSECTION_TITLES = SUBSECCOES_OPCOES_TECNICAS.map((t) => t.toLowerCase());

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

function isSectionHeading(line: string): boolean {
  const normalized = line.toLowerCase().replace(/^\d+[.)]\s*/, "");
  return SECTION_TITLES.includes(normalized);
}

function isSubsectionHeading(line: string): boolean {
  const normalized = line.toLowerCase().replace(/^\d+[.)]\s*/, "");
  return SUBSECTION_TITLES.includes(normalized);
}

export async function buildMemoriaDocx(
  meta: MemoriaDescritiva,
  text: string,
  layout: LayoutConfig = DEFAULT_LAYOUT,
): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: DOCUMENT_TITLE, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `Concelho: ${meta.concelho} — Freguesia: ${meta.freguesia}` }),
    new Paragraph({ text: `Requerente: ${meta.requerenteNome}` }),
    new Paragraph({
      text: `Técnico responsável: ${meta.tecnicoNome} (n.º ${meta.tecnicoNumeroOrdem})`,
    }),
    new Paragraph({ text: "" }),
  ];

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

    let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
    if (isSectionHeading(line)) heading = HeadingLevel.HEADING_1;
    else if (isSubsectionHeading(line)) heading = HeadingLevel.HEADING_2;

    children.push(new Paragraph(heading ? { text: line, heading } : { text: line }));
  }

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
    },
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}
