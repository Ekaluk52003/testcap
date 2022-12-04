FROM node:18-alpine AS dependencies
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URLL}
ARG DISCORD_CLIENT_ID
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ARG DISCORD_CLIENT_SECRET
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

RUN echo "echo ENV file1"
RUN echo $NEXTAUTH_SECRET



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




WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]