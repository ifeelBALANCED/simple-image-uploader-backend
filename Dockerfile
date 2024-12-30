FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

RUN pnpm run db:gen

COPY . .

EXPOSE 5001

CMD [ "pnpm", "run", "dev" ]