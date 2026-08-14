FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/migrations ./src/migrations
COPY --from=build /app/src/config ./src/config
EXPOSE 3000
CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist/config/data-source.js && node dist/server.js"]
