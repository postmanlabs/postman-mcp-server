FROM node:22.16-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.6.2 --activate
RUN adduser -D app
USER app

WORKDIR /app

COPY --chown=app ./package.json ./pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY --chown=app . ./

RUN pnpm run build

FROM node:22.16-alpine AS production-base

RUN corepack enable && corepack prepare pnpm@10.6.2 --activate
RUN adduser -D app
USER app
WORKDIR /app

COPY --chown=app ./package.json ./pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --chown=app --from=builder /app/dist ./dist

EXPOSE 1337

ENV NODE_ENV=production

FROM production-base AS production-stdio

ENTRYPOINT ["node", "dist/src/index.js"]

FROM production-stdio AS production
