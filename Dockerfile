FROM node:22.16-alpine AS builder
RUN adduser -D app
USER app

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM node:22.16-alpine AS production-base

RUN adduser -D app
USER app
WORKDIR /app

COPY --chown=app ./package*.json ./

RUN npm ci --only=production

COPY --chown=app --from=builder /app/dist ./dist

EXPOSE 1337

ENV NODE_ENV=production

FROM production-base AS production-http

ENTRYPOINT ["npm", "run", "start"]

FROM production-base AS production-stdio

ENTRYPOINT ["npm", "run", "start:stdio"]

FROM production-http AS production
