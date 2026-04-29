# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Cài dependencies trước để tận dụng cache layer
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "dev"]