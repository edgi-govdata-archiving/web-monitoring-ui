### Baseline image for development/test/build ###
# We require a lot of extras for building (Python, GCC) because of Node-Zopfli.
FROM node:10.15.3 as dev
MAINTAINER enviroDGI@gmail.com

RUN mkdir -p /app
WORKDIR /app

# Copy dependencies only so they can be cached.
COPY package.json package-lock.json ./

# Install deps.
RUN npm ci

# Finally, pull in the source.
# TODO: can we mount so this can be used for live-reload dev?
COPY . .

CMD ["/bin/bash"]


### Build a production version of the app ###
# Note this *creates* production artifacts. The docker image created here
# should never actually be distributed; it's just an intermediate.
FROM dev as build
ENV NODE_ENV=production
RUN npm run build-production


### Release Image ###
# It might feel ridiculous to build up all the same things again, but the
# resulting image is less than half the size!
FROM node:10.15.3-slim as release
MAINTAINER enviroDGI@gmail.com

# apt-get in this base image does not have dumb-init
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64
RUN chmod +x /usr/local/bin/dumb-init

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

# Copy dependencies only so they can be cached.
COPY package.json package-lock.json ./
EXPOSE 3001

# Install deps.
RUN npm ci --only=production

# Now copy all source.
COPY . .
COPY --from=build /app/dist ./dist

# Run server. Use dumb-init because Node does not handle Docker's stop signal.
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["npm", "run", "start"]
