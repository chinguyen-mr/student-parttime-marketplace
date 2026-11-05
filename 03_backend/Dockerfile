# syntax=docker/dockerfile:1
# Build context: repository ROOT
# Build:  docker build -f 03_backend/Dockerfile -t jobnest-backend .

# ----- Stage 1: Install production dependencies -----
FROM node:20-alpine AS deps
WORKDIR /app
COPY 03_backend/package.json 03_backend/package-lock.json ./
RUN npm ci --omit=dev

# ----- Stage 2: Runtime -----
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY 03_backend/package.json ./
COPY 03_backend/src ./src
# migrate.js / seed.js dùng path.resolve(__dirname, '../../../02_database')
# = /app/../02_database = /02_database
COPY 02_database /02_database

RUN chown -R app:app /app /02_database
USER app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/health >/dev/null 2>&1 || exit 1

CMD ["node", "src/server.js"]
