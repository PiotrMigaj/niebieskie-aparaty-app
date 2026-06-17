# syntax=docker/dockerfile:1.7
ARG NODE_IMAGE=node:22.12-alpine

# ---- builder ----
FROM ${NODE_IMAGE} AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

RUN npm install -g corepack@latest \
 && corepack enable

COPY package.json pnpm-lock.yaml ./

RUN corepack prepare --activate \
 && pnpm config set store-dir /pnpm/store

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# ---- runtime ----
FROM ${NODE_IMAGE} AS runtime

ENV NODE_ENV=production
ENV NITRO_PORT=4600
ENV NITRO_HOST=0.0.0.0

WORKDIR /app

RUN apk add --no-cache tini \
 && addgroup -S appgroup \
 && adduser  -S -G appgroup appuser

COPY --from=builder --chown=appuser:appgroup /app/.output ./.output

USER appuser

EXPOSE 4600

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- --spider http://127.0.0.1:4600/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", ".output/server/index.mjs"]
