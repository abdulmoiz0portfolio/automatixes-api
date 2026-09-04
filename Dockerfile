FROM node:24-alpine AS builder

RUN apk update && \
    apk add --no-cache git ffmpeg wget curl bash openssl

LABEL version="2.2.3" description="Automatixes API - Enterprise WhatsApp Gateway and Automation Platform" 
LABEL maintainer="Moiz Baig" git="https://automatixes.com"
LABEL contact="contact@automatixes.com"

WORKDIR /automatixes

COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./tsup.config.ts ./

RUN npm ci --silent

COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./manager ./manager
COPY ./.env.example ./.env
COPY ./runWithProvider.js ./

COPY ./Docker ./Docker

RUN chmod +x ./Docker/scripts/* && dos2unix ./Docker/scripts/*

RUN ./Docker/scripts/generate_database.sh

RUN npm run build

FROM node:24-alpine AS final

RUN apk update && \
    apk add tzdata ffmpeg bash openssl

ENV TZ=America/Sao_Paulo
ENV DOCKER_ENV=true

WORKDIR /automatixes

COPY --from=builder /automatixes/package.json ./package.json
COPY --from=builder /automatixes/package-lock.json ./package-lock.json

COPY --from=builder /automatixes/node_modules ./node_modules
COPY --from=builder /automatixes/dist ./dist
COPY --from=builder /automatixes/prisma ./prisma
COPY --from=builder /automatixes/manager ./manager
COPY --from=builder /automatixes/public ./public
COPY --from=builder /automatixes/.env ./.env
COPY --from=builder /automatixes/Docker ./Docker
COPY --from=builder /automatixes/runWithProvider.js ./runWithProvider.js
COPY --from=builder /automatixes/tsup.config.ts ./tsup.config.ts

ENV DOCKER_ENV=true

EXPOSE 8080

ENTRYPOINT ["/bin/bash", "-c", ". ./Docker/scripts/deploy_database.sh && npm run start:prod" ]
