CREATE TYPE "public"."alinhamento" AS ENUM('esquerda', 'justificado');--> statement-breakpoint
CREATE TYPE "public"."espacamento" AS ENUM('simples', 'media', 'duplo');--> statement-breakpoint
CREATE TYPE "public"."natureza_predio" AS ENUM('rustica', 'urbana', 'mista');--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "requerente_nif" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "requerente_morada" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "natureza_predio" "natureza_predio" NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "numero_registo_predial" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "area_terreno" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "confrontacao_norte" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "confrontacao_sul" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "confrontacao_nascente" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "confrontacao_poente" text NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "numero_estacionamentos" integer;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "cota_soleira" numeric;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "area_impermeabilizacao" numeric;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "compartimentos" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "docx_fonte" text DEFAULT 'Times New Roman' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "docx_tamanho_pt" integer DEFAULT 11 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "docx_espacamento" "espacamento" DEFAULT 'simples' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "docx_alinhamento" "alinhamento" DEFAULT 'justificado' NOT NULL;