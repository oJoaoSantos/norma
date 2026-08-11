CREATE TYPE "public"."status" AS ENUM('rascunho', 'gerado', 'exportado');--> statement-breakpoint
CREATE TYPE "public"."tipo_obra" AS ENUM('construcao_nova', 'ampliacao', 'alteracao', 'demolicao');--> statement-breakpoint
CREATE TABLE "memorias_descritivas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requerente_nome" text NOT NULL,
	"tecnico_nome" text NOT NULL,
	"tecnico_numero_ordem" text NOT NULL,
	"concelho" text NOT NULL,
	"freguesia" text NOT NULL,
	"artigo_matricial" text NOT NULL,
	"morada" text NOT NULL,
	"area_total_construcao" numeric NOT NULL,
	"area_implantacao" numeric NOT NULL,
	"cercea_metros" numeric NOT NULL,
	"numero_pisos" integer NOT NULL,
	"volume_metros_cubicos" numeric,
	"revestimento_fachada" text NOT NULL,
	"caixilharia" text NOT NULL,
	"isolamento_termico_acustico" text NOT NULL,
	"tipo_obra" "tipo_obra" NOT NULL,
	"generated_text" text,
	"status" "status" DEFAULT 'rascunho' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
