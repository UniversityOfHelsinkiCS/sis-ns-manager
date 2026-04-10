FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/sis-ns-manager-frontend/dist ./sis-ns-manager-frontend/dist
COPY sis-ns-manager-backend ./sis-ns-manager-backend
COPY sis-ns-manager-frontend/src/types.ts ./sis-ns-manager-frontend/src/types.ts
EXPOSE 3000
CMD ["npm", "run", "start"]
