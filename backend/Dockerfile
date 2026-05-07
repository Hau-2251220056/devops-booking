FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY scripts ./scripts
COPY tests ./tests
COPY database ./database

RUN npx prisma generate


FROM node:22-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& useradd --create-home --uid 1001 appuser

COPY package*.json ./
RUN npm ci --omit=dev \
	&& npm cache clean --force

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

USER appuser

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]