#######################
## DEVELOPMENT STAGE ##
#######################
FROM node:22-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies required for building native modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better build caching
COPY package*.json ./

# Install dependencies (with legacy peer deps to avoid version conflicts)
RUN npm ci --legacy-peer-deps && \
    npm install -g @angular/cli

# Copy the full app source
COPY . .

# Rebuild lightningcss from source (fixes musl build issue)
RUN npm rebuild lightningcss

# Build the Angular app
RUN ng build shell --configuration=production

#######################
## PRODUCTION STAGE ##
#######################
FROM nginx:1.27.5-alpine AS production

# Set environment variable
ENV NODE_ENV=production

# Copy build output from development stage
COPY --from=development /usr/src/app/dist/shell/browser /usr/share/nginx/html

# Copy custom nginx configuration (optional)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]
