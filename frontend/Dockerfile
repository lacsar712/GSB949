# Build stage
FROM node:20 AS builder

WORKDIR /app

# 设置npm淘宝镜像
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install

COPY . .
RUN npm rebuild esbuild || true
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
