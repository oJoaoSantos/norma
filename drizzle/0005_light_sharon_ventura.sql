CREATE TYPE "public"."permissao" AS ENUM('visualizacao', 'edicao');--> statement-breakpoint
ALTER TABLE "projeto_acessos" ADD COLUMN "permissao" "permissao" DEFAULT 'visualizacao' NOT NULL;