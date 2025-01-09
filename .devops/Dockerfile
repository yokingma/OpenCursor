FROM node:20 AS build

WORKDIR /app

COPY . .

RUN npm install && npm run build

FROM node:20-alpine AS production

WORKDIR /app

# 安装 curl，下载并安装 dotenvx，然后删除 curl
RUN apk add --no-cache curl && \
    curl -fsS https://dotenvx.sh/ | sh

COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./
COPY --from=build /app/package.json ./

RUN npm ci --production && \
    npm cache clean --force

EXPOSE 3000
CMD ["npm", "run", "start"]
