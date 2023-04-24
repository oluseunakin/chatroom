# syntax=docker/dockerfile:1
FROM node:18-alpine AS build
WORKDIR /
COPY package* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html