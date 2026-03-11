FROM node:18-alpine AS base
FROM base AS deps

RUN apk --no-cache add --virtual .builds-deps build-base python3 libc6-compat

ARG USER_ID=10001
ARG USER_GROUP_ID=10001
ARG USER_HOME=/home/app

WORKDIR ${USER_HOME}
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder

ARG USER_HOME=/home/app
WORKDIR ${USER_HOME}
COPY --from=deps ${USER_HOME}/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner

ARG USER_HOME=/home/app
ARG USER_ID=10001
ARG USER_GROUP_ID=10001

WORKDIR ${USER_HOME}

COPY --from=builder --chown=${USER_ID}:${USER_GROUP_ID} /home/app/.next ./.next
COPY --from=builder --chown=${USER_ID}:${USER_GROUP_ID} /home/app/public ./public
COPY --from=builder --chown=${USER_ID}:${USER_GROUP_ID} /home/app/node_modules ./node_modules
COPY --from=builder --chown=${USER_ID}:${USER_GROUP_ID} /home/app/server.js /home/app/
COPY --from=builder --chown=${USER_ID}:${USER_GROUP_ID} /home/app/package.json ./package.json

USER 10001
EXPOSE 3002

ENV NODE_ENV=production
ENV PORT 3002
ENV NEXTAUTH_SECRET=V9Ogd83zDs4BtBqZf7rw7fVx/7KrYQfA+8LO2BMuJvo=
CMD ["node", "server.js"]