FROM node:18-alpine AS dependencies
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN echo "value for DATABASE_URL: ${DATABASE_URL}"

WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:18-alpine AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS deploy
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN echo "value for DATABASE_URL: ${DATABASE_URL}"


WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]