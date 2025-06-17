### Baseline image for development/test/build ###
# We require a lot of extras for building (Python, GCC) because of Node-Zopfli.
FROM node:22.16.0 as dev
LABEL maintainer="enviroDGI@gmail.com"

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
FROM node:22.16.0-slim as release
LABEL maintainer="enviroDGI@gmail.com"

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

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
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
