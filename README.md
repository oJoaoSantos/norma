# Norma

Assistente que gera Memórias Descritivas e Justificativas — o documento
técnico/legal exigido pelas Câmaras Municipais portuguesas em processos de
licenciamento e comunicação prévia (RJUE/RGEU) — a partir dos dados do
projeto e da legislação nacional/municipal aplicável.

Stack: Next.js (App Router) + Drizzle ORM/Postgres + LLM open-weight (Llama,
via Ollama local ou Groq — ver `src/lib/llm/`) + `docx` para exportação
Word. Sem dependência de APIs de IA fechadas (OpenAI/Anthropic/etc.).

## Desenvolvimento local

Precisas de Postgres e Ollama a correr (nativamente via Homebrew, ou com
`docker compose -f docker-compose.dev.yml up -d`).

```bash
cp .env.example .env   # preenche AUTH_SECRET, ROOT_*, ADMIN_*
npm install
npm run db:migrate
npm run db:seed-admin  # cria o utilizador root + entidade demo + admin
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy (grátis, self-hosted, always-on)

Guia para pôr a app online sem custo. Usa **Google Cloud "Always Free"**
(instância `e2-micro`, grátis para sempre, não é trial) para a app + base
de dados, e **Groq** (API gratuita que serve modelos open-weight, ex.
Llama) para a geração de texto — a `e2-micro` só tem 1GB RAM, insuficiente
para correr um LLM local a par da app, por isso a inferência sai da VM.

> Já tentámos primeiro o Oracle Cloud Always Free (tem RAM que chegue para
> correr o Ollama localmente, 100% self-hosted) mas ficou bloqueado no
> registo pelo sistema anti-fraude deles — se em algum momento destrancares
> essa conta, dá para voltar a esse caminho (basta pôr `LLM_PROVIDER=ollama`
> e correr o Ollama numa VM com mais RAM).

### 1. Criar a chave da Groq

Em [console.groq.com/keys](https://console.groq.com/keys), cria uma conta
(sem cartão necessário para o tier gratuito) e gera uma API key. Guarda-a —
vais precisar dela no `.env`.

### 2. Criar a VM

1. Cria uma conta em [cloud.google.com](https://cloud.google.com) (pede
   cartão para verificação; o tier Always Free em si não é cobrado).
2. Cria uma instância Compute Engine: shape **e2-micro**, numa das regiões
   elegíveis para Always Free — `us-west1`, `us-central1` ou `us-east1`
   (fora destas, a instância deixa de ser grátis). Imagem Ubuntu (LTS mais
   recente). Nota: por estar nos EUA, há alguma latência extra para
   utilizadores em Portugal — aceitável para validação inicial.
3. Nas regras de firewall da VM, permite tráfego HTTP (porta 80) e HTTPS
   (porta 443) de qualquer origem.

### 3. Preparar a VM

Por SSH à VM:

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER   # faz logout/login outra vez a seguir a isto

# swap de segurança — a e2-micro só tem 1GB RAM, isto dá alguma margem
# para não rebentar com Postgres + Next.js + Caddy ao mesmo tempo
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

git clone <o-url-do-teu-repositório> norma
cd norma
cp .env.production.example .env
nano .env   # preenche AUTH_SECRET (openssl rand -base64 33), GROQ_API_KEY, ROOT_*, ADMIN_*, e DOMAIN se tiveres um (deixa ":80" se não tiveres)
```

### 4. Subir tudo

```bash
docker compose up -d --build
```

O serviço `migrate` corre as migrações e o seed inicial automaticamente
antes da app arrancar (é seguro correr `docker compose up -d --build` outra
vez em deploys seguintes — migrações e seed são idempotentes).

Com `DOMAIN=:80` (o valor por omissão), a app já fica acessível em
`http://<IP-da-VM>`. Trocando `DOMAIN` por um domínio real e apontando o
DNS (registo A) para o IP da VM, a Caddy trata do HTTPS automático (Let's
Encrypt) sozinha — não precisas de fazer mais nada.

### Atualizar depois de alterações ao código

```bash
git pull
docker compose up -d --build
```
