ALTER TABLE "memorias_descritivas" DROP CONSTRAINT "memorias_descritivas_projeto_id_projetos_id_fk";
--> statement-breakpoint
ALTER TABLE "memorias_descritivas" ADD CONSTRAINT "memorias_descritivas_projeto_id_projetos_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos"("id") ON DELETE cascade ON UPDATE no action;