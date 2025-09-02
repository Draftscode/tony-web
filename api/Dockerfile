FROM node:22-alpine  AS development


# Install dependencies for Puppeteer + Chromium
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
      chromium-chromedriver

# Specify our working directory, this is in our container/in our image
WORKDIR /usr/src/app

# Copy the package.jsons from host to container
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Here we install all the deps
RUN npm install --include=optional  && \
    npm i -g @nestjs/cli && \
    npm rebuild sharp

# Bundle app source / copy all other files
COPY . .

# Build the app to the /dist folder
RUN npm run build

EXPOSE 3000

################
## PRODUCTION ##
################
# Build another image named production
FROM node:22-alpine AS production

# Install Chromium dependencies in production image
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

# Set node env to prod
ARG NODE_ENV=production

# Set Working Directory
WORKDIR /usr/src/app

# Copy all from development stage
COPY --from=development /usr/src/app/ .

EXPOSE 3000

RUN ls -l dist/

# run commands
CMD ["node", "dist/main"]