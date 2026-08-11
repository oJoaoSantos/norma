CREATE TYPE "public"."role" AS ENUM('admin', 'arquiteto', 'engenheiro');--> statement-breakpoint
CREATE TABLE "legislacao_concelhos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concelho" text NOT NULL,
	"conteudo" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "legislacao_concelhos_concelho_unique" UNIQUE("concelho")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD CONSTRAINT "memorias_descritivas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;