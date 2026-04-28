# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Cài dependencies trước để tận dụng cache layer
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]