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
COPY --from=build /app/frontend/dist ./frontend/dist
COPY backend ./backend
EXPOSE 3001
CMD ["npm", "run", "start"]
