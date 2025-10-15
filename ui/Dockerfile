#######################
## DEVELOPMENT STAGE ##
#######################
# specify node verson and image
# also choose a unique name to target later
FROM node:22-alpine AS development
# specify working directory inside container
WORKDIR /usr/src/app

COPY package*.json ./

# install dev dependencies only
RUN npm i --legacy-peer-deps && \
    npm i -g @angular/cli

COPY . .

RUN ng build shell --configuration=production

#######################
## PRODDUCTION STAGE ##dir
#######################
FROM nginx:1.27.5-alpine AS production

# set variable to environment
ENV NODE_ENV=production

# copy from previous stage
COPY --from=development /usr/src/app/dist/shell/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# run commands
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]