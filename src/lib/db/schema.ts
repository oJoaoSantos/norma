import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const tipoObraEnum = pgEnum("tipo_obra", [
  "construcao_nova",
  "ampliacao",
  "alteracao",
  "demolicao",
]);

export const statusEnum = pgEnum("status", [
  "rascunho",
  "gerado",
  "exportado",
]);

export const roleEnum = pgEnum("role", [
  "root",
  "admin",
  "arquiteto",
  "engenheiro",
]);

export const memoriaTipoEnum = pgEnum("memoria_tipo", ["arquitetura"]);

export const naturezaPredioEnum = pgEnum("natureza_predio", [
  "rustica",
  "urbana",
  "mista",
]);

export const espacamentoEnum = pgEnum("espacamento", [
  "simples",
  "media",
  "duplo",
]);

export const alinhamentoEnum = pgEnum("alinhamento", [
  "esquerda",
  "justificado",
]);

export const permissaoEnum = pgEnum("permissao", ["visualizacao", "edicao"]);

/**
 * Uma entidade = um atelier/empresa cliente. Isola utilizadores, projetos e
 * memórias entre si. Gerida só pelo papel "root" — ver src/app/root/.
 */
export const entidades = pgTable("entidades", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Entidade = typeof entidades.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  numeroOrdem: text("numero_ordem"),
  role: roleEnum("role").notNull(),
  active: boolean("active").notNull().default(true),

  // Nulo apenas para "root" — não pertence a nenhuma entidade.
  entidadeId: uuid("entidade_id").references(() => entidades.id),

  // Formatação pessoal do .docx (aplicada quando este utilizador exporta)
  docxFonte: text("docx_fonte").notNull().default("Times New Roman"),
  docxTamanhoPt: integer("docx_tamanho_pt").notNull().default(11),
  docxEspacamento: espacamentoEnum("docx_espacamento").notNull().default("simples"),
  docxAlinhamento: alinhamentoEnum("docx_alinhamento").notNull().default("justificado"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NovoUser = typeof users.$inferInsert;
export type Role = (typeof roleEnum.enumValues)[number];

export const legislacaoConcelhos = pgTable("legislacao_concelhos", {
  id: uuid("id").primaryKey().defaultRandom(),
  concelho: text("concelho").notNull().unique(),
  conteudo: text("conteudo").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type LegislacaoConcelho = typeof legislacaoConcelhos.$inferSelect;

export const projetos = pgTable("projetos", {
  id: uuid("id").primaryKey().defaultRandom(),
  entidadeId: uuid("entidade_id").notNull().references(() => entidades.id),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Projeto = typeof projetos.$inferSelect;

/** Presença de uma linha = o utilizador tem acesso ao projeto (partilha). */
export const projetoAcessos = pgTable("projeto_acessos", {
  id: uuid("id").primaryKey().defaultRandom(),
  projetoId: uuid("projeto_id")
    .notNull()
    .references(() => projetos.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  permissao: permissaoEnum("permissao").notNull().default("visualizacao"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ProjetoAcesso = typeof projetoAcessos.$inferSelect;

export interface Compartimento {
  nome: string;
  area: number;
}

export const memoriasDescritivas = pgTable("memorias_descritivas", {
  id: uuid("id").primaryKey().defaultRandom(),

  projetoId: uuid("projeto_id")
    .notNull()
    .references(() => projetos.id, { onDelete: "cascade" }),
  tipo: memoriaTipoEnum("tipo").notNull().default("arquitetura"),
  versaoAtual: integer("versao_atual").notNull().default(1),

  createdBy: uuid("created_by").references(() => users.id),

  // Requerente
  requerenteNome: text("requerente_nome").notNull(),
  requerenteNif: text("requerente_nif").notNull(),
  requerenteMorada: text("requerente_morada").notNull(),

  // Técnico responsável
  tecnicoNome: text("tecnico_nome").notNull(),
  tecnicoNumeroOrdem: text("tecnico_numero_ordem").notNull(),

  // Localização da obra
  concelho: text("concelho").notNull(),
  freguesia: text("freguesia").notNull(),
  artigoMatricial: text("artigo_matricial").notNull(),
  morada: text("morada").notNull(),
  naturezaPredio: naturezaPredioEnum("natureza_predio").notNull(),
  numeroRegistoPredial: text("numero_registo_predial").notNull(),

  // Terreno e confrontações
  areaTerreno: numeric("area_terreno").notNull(),
  confrontacaoNorte: text("confrontacao_norte").notNull(),
  confrontacaoSul: text("confrontacao_sul").notNull(),
  confrontacaoNascente: text("confrontacao_nascente").notNull(),
  confrontacaoPoente: text("confrontacao_poente").notNull(),
  enquadramentoEnvolvente: text("enquadramento_envolvente"),

  // Parâmetros urbanísticos
  areaTotalConstrucao: numeric("area_total_construcao").notNull(),
  areaImplantacao: numeric("area_implantacao").notNull(),
  cerceaMetros: numeric("cercea_metros").notNull(),
  numeroPisos: integer("numero_pisos").notNull(),
  volumeMetrosCubicos: numeric("volume_metros_cubicos"),
  numeroEstacionamentos: integer("numero_estacionamentos"),
  cotaSoleira: numeric("cota_soleira"),
  areaImpermeabilizacao: numeric("area_impermeabilizacao"),

  // Compartimentos (opcional — lista nome + área)
  compartimentos: jsonb("compartimentos").$type<Compartimento[]>(),

  // Materiais e acabamentos
  revestimentoFachada: text("revestimento_fachada").notNull(),
  caixilharia: text("caixilharia").notNull(),
  isolamentoTermicoAcustico: text("isolamento_termico_acustico").notNull(),

  // Tipo de obra
  tipoObra: tipoObraEnum("tipo_obra").notNull(),

  // Resultado (estado atual — a versão mais recente vive também em memoria_versoes)
  generatedText: text("generated_text"),
  status: statusEnum("status").notNull().default("rascunho"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MemoriaDescritiva = typeof memoriasDescritivas.$inferSelect;
export type NovaMemoriaDescritiva = typeof memoriasDescritivas.$inferInsert;

/** Histórico do texto gerado ao longo do tempo — ver "Regenerar" na página da memória. */
export const memoriaVersoes = pgTable("memoria_versoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  memoriaId: uuid("memoria_id")
    .notNull()
    .references(() => memoriasDescritivas.id, { onDelete: "cascade" }),
  versao: integer("versao").notNull(),
  generatedText: text("generated_text").notNull(),
  status: statusEnum("status").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MemoriaVersao = typeof memoriaVersoes.$inferSelect;
