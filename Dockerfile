FROM node:20-alpine as build-stage

WORKDIR /app

RUN npm install -g pnpm

COPY . .
RUN rm -rf node_modules
RUN rm -rf pnpm-lock.yaml
RUN pnpm install
RUN pnpm build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/blog /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
