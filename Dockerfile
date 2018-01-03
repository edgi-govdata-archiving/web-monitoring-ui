FROM node:8.2.1
MAINTAINER enviroDGI@gmail.com

RUN apt-get update && apt-get install apt-transport-https -y  # needed to process yarn's sources

# Add yarn and install it.
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y yarn

RUN mkdir -p /app
WORKDIR /app

EXPOSE 3001

ENV NODE_ENV=PRODUCTION

# Copy dependencies only so they can be cached.
COPY package.json yarn.lock ./

# Install deps.
RUN yarn install --no-cache --frozen-lockfile

# Also until the gulp CLI.
RUN npm install -g gulp-cli

# Now copy all source.
COPY . .

# Build for production.
RUN gulp

# Run server.
CMD yarn run start
