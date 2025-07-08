# 构建阶段
FROM node:20-alpine AS build-stage

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖（包括开发依赖）
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM nginx:stable-alpine AS production-stage

# 复制构建产物到 Nginx 目录
COPY --from=build-stage /app/dist/blog /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]


## 直接使用本地构建好的文件
#FROM nginx:stable-alpine
#
#COPY nginx.conf /etc/nginx/nginx.conf
#COPY ./dist/blog /usr/share/nginx/html
#EXPOSE 80
#
#CMD ["nginx", "-g", "daemon off;"]
