# ---------- BASE (shared deps) ----------
FROM node:24-slim AS base

WORKDIR /usr/src/app

# Install Chromium + required libs (shared by dev & prod)
RUN apt-get update && apt-get install -y \
  chromium \
  ca-certificates \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libgtk-3-0 \
  libglib2.0-0 \
  libdrm2 \
  libxfixes3 \
  libxext6 \
  libxi6 \
  libxtst6 \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium


# ---------- DEVELOPMENT ----------
FROM base AS development

COPY package*.json ./
RUN npm install && npm i -g @nestjs/cli

COPY . .

# optional: if you run dev server
CMD ["npm", "run", "start:dev"]


# ---------- BUILD ----------
FROM base AS builder

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- PRODUCTION ----------
FROM base AS production

# copy only what we need
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/uploads ./uploads

EXPOSE 3000

CMD ["node", "dist/main"]