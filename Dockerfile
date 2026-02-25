# Use the official Node.js LTS image
# See all versions at https://hub.docker.com/_/node
FROM oven/bun AS build-base
WORKDIR /usr/src/app


# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM build-base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock drizzle.config.ts drizzle /temp/prod/
RUN cd /temp/prod && bun i --only=production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM build-base AS prerelease

ENV UPLOAD_PATH=/uploads

COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
#RUN npm test
RUN bun run build

# Copy production dependencies and source code into final image
FROM node:lts-alpine AS runtime

RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build .
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/drizzle.config.ts .
COPY --from=prerelease /usr/src/app/drizzle ./drizzle

ENV PORT=3001
ENV BODY_SIZE_LIMIT=Infinity

RUN mkdir -p /uploads && chown node:node /uploads

EXPOSE 3001/tcp

COPY --chmod=755 <<EOT /entrypoint.sh
#!/bin/sh
set -e
npm run db:migrate --config=drizzle.config.ts && node ./index.js
EOT

ENTRYPOINT ["/entrypoint.sh"]
