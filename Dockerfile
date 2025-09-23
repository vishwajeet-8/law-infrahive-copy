#node block
FROM node:23-alpine AS nodework
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# nginx block
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -f ./*
COPY --from=nodework /app/dist .

RUN echo ' \
server { \
    listen       80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri /index.html; \
    } \
    error_page   500 502 503 504  /50x.html; \
    location = /50x.html { \
        root   /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]