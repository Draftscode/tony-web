######################
# DEVELOPMENT STAGE  #
######################
FROM node:22-alpine AS development

# Install all needed system dependencies in one layer
# Includes Chromium deps + build tools for native npm modules
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
      bash \
      udev \
      lcms2 \
      git \
      chromium-chromedriver \
      python3 \
      make \
      g++ \
      build-base

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install --include=optional && \
    npm i -g @nestjs/cli && \
    npm rebuild sharp && \
    npm rebuild lightningcss --build-from-source

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Expose application port
EXPOSE 3000



######################
# PRODUCTION STAGE   #
######################
FROM node:22-alpine AS production

# Install only what's needed to run the app + Chromium deps
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      udev \
      lcms2 \
      chromium-chromedriver

# Set working directory
WORKDIR /usr/src/app

# Set node environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy from build stage
COPY --from=development /usr/src/app/ ./

# Optional: sanity check build output
RUN ls -l dist/

# Expose application port
EXPOSE 3000

# Start app
CMD ["node", "dist/main"]
