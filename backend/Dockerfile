# Imagem de produção do backend. Uso opcional — Render e Railway também
# sabem buildar um projeto Node.js diretamente do package.json, sem Dockerfile.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
EXPOSE 4000
CMD ["sh", "-c", "npm run migrate:up && node dist/server.js"]
