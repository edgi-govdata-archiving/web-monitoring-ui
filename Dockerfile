### Baseline image for development/test/build ###
# We require a lot of extras for building (Python, GCC) because of Node-Zopfli.
FROM dhi.io/node:22-debian13-dev as dev
LABEL maintainer="enviroDGI@gmail.com"

# Extras for devcontainer + CI use on top of the hardened dev base.
RUN apt-get update && apt-get install -y --no-install-recommends \
        gzip \
        tar \
        ca-certificates \
        git \
        procps \
        less \
        ncurses-base \
        ncurses-term \
    && rm -rf /var/lib/apt/lists/* \
    && ldconfig

# Configure Git pager nicely + set a proper TERM so less doesn't complain
RUN git config --global core.pager "less -FRX" \
    && echo 'export TERM=xterm-256color' >> /etc/profile.d/dev.sh

RUN mkdir -p /app
WORKDIR /app

CMD ["/bin/bash"]

### Build a production version of the app ###
# Note this *creates* production artifacts. The docker image created here
# should never actually be distributed; it's just an intermediate
FROM dev as build
# We need dumb-init to handle Docker's stop signal, but since the final image has no build tools, we have to install it here and copy it over later.
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# Copy dependencies only so they can be cached.
COPY package.json package-lock.json ./

# Install deps (including devDependencies needed for the build).
RUN npm ci

# Pull in the source.
COPY . .

ENV NODE_ENV=production
RUN npm run build-production
RUN npm prune --omit=dev

### Release Image ###
FROM dhi.io/node:22-debian13 as release
LABEL maintainer="enviroDGI@gmail.com"

# WORKDIR creates the directory if it doesn't exist.
WORKDIR /app

# Copy production artifacts from the build stage.
# Explicit copying provides:
# 1. Security: only includes necessary files, prevents accidental bloat
# 2. Documentation: clarifies production dependencies
# 3. Explicit control: clear visibility of what's included
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist                                                                                                       
COPY --from=build /app/server ./server
COPY --from=build /app/views ./views    
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src/scripts/formatters.js ./src/scripts/formatters.js                                                                                                

ENV NODE_ENV=production

EXPOSE 3001

# Run server. Use dumb-init because Node does not handle Docker's stop signal.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/app.js"]
