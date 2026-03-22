FROM node:20-slim AS base

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://railway.com/install.sh | sh

RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
