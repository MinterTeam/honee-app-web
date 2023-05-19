FROM node:18 as builder

ARG BUILD_BRANCH_ENV_PREFIX

WORKDIR /app
# Install dependencies separately to cache them
# https://stackoverflow.com/a/43190345/4936667
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Two steps to copy .env.branch only if no .env exists
# (it is needed to support docker-compose with local env and kubernetes prod build at the same time)
# 1. just copy
COPY .env${BUILD_BRANCH_ENV_PREFIX} .env
# 2. overwrite .env back if it exists (dummy package.json to ensure COPY not to fail)
COPY package.json .en[v] ./
RUN npm run production

FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/.docker/vhost.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
