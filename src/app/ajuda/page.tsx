import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajuda — Norma",
};

const DICAS = [
  {
    titulo: "Organiza o trabalho por Projetos",
    texto:
      "Cada obra/processo é um Projeto, em \"Projetos\". Um projeto pode conter várias Memórias Descritivas — útil para versões diferentes ou tipos de intervenção na mesma morada.",
  },
  {
    titulo: "Preenche o teu perfil primeiro",
    texto:
      "Em /perfil defines o teu nome e número de ordem (OA/OE). É usado automaticamente como técnico responsável em todas as memórias que gerares — não precisas de o escrever de cada vez.",
  },
  {
    titulo: "Gera a partir de um projeto",
    texto:
      "Dentro de um projeto, o botão \"Nova Memória\" abre o formulário guiado (requerente, localização, áreas, materiais…) e termina com o texto gerado por IA.",
  },
  {
    titulo: "Escolhe a localização por dropdown",
    texto:
      "No passo de Localização seleciona distrito, concelho e freguesia da lista — evita erros de escrita e garante que o nome do concelho corresponde exatamente ao que a Câmara espera.",
  },
  {
    titulo: "Revê sempre antes de exportar",
    texto:
      "O texto é gerado por IA a partir dos dados que preenches e da legislação registada na aplicação. Confirma nomes, áreas e citações legais antes de exportar — a responsabilidade pelo conteúdo final é sempre do técnico.",
  },
  {
    titulo: "Regenera para criar uma nova versão",
    texto:
      "Na página da memória, \"Regenerar\" cria uma nova versão do texto (útil depois de a legislação ser atualizada). As versões anteriores ficam guardadas e continuam exportáveis em \"Versões anteriores\".",
  },
  {
    titulo: "Partilha o projeto com colegas",
    texto:
      "Em cada projeto, quem o criou (ou tem acesso de edição) pode partilhá-lo com outros utilizadores da tua organização, com dois níveis: Visualização (só vê e exporta) ou Edição (também pode gerar/regenerar memórias e gerir a partilha).",
  },
  {
    titulo: "Exporta em .docx",
    texto:
      "O botão \"Exportar .docx\" gera um Word já formatado com título e secções, pronto a ajustar e a submeter à Câmara Municipal.",
  },
];

const FAQ = [
  {
    pergunta: "A IA substitui o técnico responsável?",
    resposta:
      "Não. A Norma é uma ferramenta de apoio à escrita — quem assina e é responsável pelo projeto e pelo conteúdo da memória descritiva é sempre o técnico (arquiteto ou engenheiro).",
  },
  {
    pergunta: "A legislação citada está sempre correta?",
    resposta:
      "A base legal nacional (RJUE/RGEU) é revista manualmente pela equipa, mas a parte específica de cada concelho (PDM) depende do que estiver registado nessa aplicação para esse concelho — nem todos têm essa informação preenchida ainda. Confirma sempre as citações antes de submeter um processo.",
  },
  {
    pergunta: "Posso editar o texto depois de gerado?",
    resposta:
      "Sim. Antes de exportar tens uma caixa de texto totalmente editável para ajustares o que for preciso.",
  },
  {
    pergunta: "Quem pode ver um projeto e as suas memórias?",
    resposta:
      "Por omissão, só quem o criou e o admin da tua organização. Para mais alguém ver ou trabalhar nesse projeto, é preciso partilhá-lo explicitamente (secção \"Partilhar\" dentro do projeto).",
  },
  {
    pergunta: "Qual a diferença entre partilha de Visualização e de Edição?",
    resposta:
      "Visualização deixa ver o projeto e exportar as memórias existentes. Edição permite também gerar/regenerar memórias nesse projeto e gerir quem mais tem acesso.",
  },
  {
    pergunta: "Como mudo a minha password ou número de ordem?",
    resposta: "Em /perfil, a qualquer momento.",
  },
  {
    pergunta: "Quem pode criar novas contas?",
    resposta:
      "Só administradores da tua organização. Se precisares de acesso, contacta o teu administrador.",
  },
  {
    pergunta: "Em que formatos posso exportar?",
    resposta: "Por agora só em .docx (Microsoft Word).",
  },
  {
    pergunta: "Os meus dados ficam guardados onde?",
    resposta:
      "Numa base de dados própria da aplicação, isolada por organização — os projetos e memórias que crias ficam associados à tua organização e visíveis conforme o projeto e a partilha, não a toda a gente que usa a Norma.",
  },
];

export default function AjudaPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-14 px-6 py-16">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Ajuda</h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          A Norma ajuda arquitetos e engenheiros a preparar Memórias
          Descritivas e Justificativas para processos de licenciamento e
          comunicação prévia em Câmaras Municipais portuguesas — combinando
          os dados do teu projeto com a legislação aplicável, para poupares
          horas de copy-paste manual.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Como usar</h2>
        <ol className="flex flex-col gap-5">
          {DICAS.map((dica, i) => (
            <li key={dica.titulo} className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white dark:bg-white dark:text-black">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{dica.titulo}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {dica.texto}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
        <div className="flex flex-col divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {FAQ.map((item) => (
            <details key={item.pergunta} className="group p-4">
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.pergunta}
                  <span className="text-zinc-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {item.resposta}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
