### Baseline image for development/test/build ###
# We require a lot of extras for building (Python, GCC) because of Node-Zopfli.
FROM node:8.10.0 as dev
MAINTAINER enviroDGI@gmail.com

# apt-transport-https is needed to process yarn sources
RUN apt-get update && apt-get install -y apt-transport-https

# Add yarn and install it.
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y yarn

RUN mkdir -p /app
WORKDIR /app

# Copy dependencies only so they can be cached.
COPY package.json yarn.lock ./

# Install deps.
RUN yarn install --no-cache --frozen-lockfile

# Finally, pull in the source.
# TODO: can we mount so this can be used for live-reload dev?
COPY . .

CMD ["/bin/bash"]


### Build a production version of the app ###
# Note this *creates* production artifacts. The docker image created here
# should never actually be distributed; it's just an intermediate.
FROM dev as build
ENV NODE_ENV=production
RUN yarn run build-production


### Release Image ###
# It might feel ridiculous to build up all the same things again, but the
# resulting image is less than half the size!
FROM node:8.10.0-slim as release
MAINTAINER enviroDGI@gmail.com

# apt-transport-https is needed to process yarn sources
RUN apt-get update && apt-get install -y apt-transport-https

# Add yarn and install it.
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y yarn

# apt-get in this base image does not have dumb-init
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64
RUN chmod +x /usr/local/bin/dumb-init

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

# Copy dependencies only so they can be cached.
COPY package.json yarn.lock ./
EXPOSE 3001

# Install deps.
RUN yarn install --no-cache --frozen-lockfile --production

# Now copy all source.
COPY . .
COPY --from=build /app/dist ./dist

# Run server. Use dumb-init because Node does not handle Docker's stop signal.
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["yarn", "run", "start"]
