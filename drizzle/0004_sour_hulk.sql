CREATE TYPE "public"."memoria_tipo" AS ENUM('arquitetura');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'root' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE "entidades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memoria_versoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memoria_id" uuid NOT NULL,
	"versao" integer NOT NULL,
	"generated_text" text NOT NULL,
	"status" "status" NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projeto_acessos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projeto_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projetos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entidade_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "projeto_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "tipo" "memoria_tipo" DEFAULT 'arquitetura' NOT NULL;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "versao_atual" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "entidade_id" uuid;--> statement-breakpoint
ALTER TABLE "memoria_versoes" ADD CONSTRAINT "memoria_versoes_memoria_id_memorias_descritivas_id_fk" FOREIGN KEY ("memoria_id") REFERENCES "public"."memorias_descritivas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memoria_versoes" ADD CONSTRAINT "memoria_versoes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projeto_acessos" ADD CONSTRAINT "projeto_acessos_projeto_id_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projeto_acessos" ADD CONSTRAINT "projeto_acessos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_entidade_id_entidades_id_fk" FOREIGN KEY ("entidade_id") REFERENCES "public"."entidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD CONSTRAINT "memorias_descritivas_projeto_id_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_entidade_id_entidades_id_fk" FOREIGN KEY ("entidade_id") REFERENCES "public"."entidades"("id") ON DELETE no action ON UPDATE no action;