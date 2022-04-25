FROM node:16.10.0-alpine as base
# Set workdir
WORKDIR /api
# Install curl and pnpm
RUN apk update && \
    apk add curl && \
    curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm


FROM base as build
# Set the workdir
WORKDIR /api/build
# Copy the lock files
COPY package.json pnpm-lock.yaml /api/build/
# Fetch 
RUN pnpm fetch --prod && \
    pnpm install
# Add all files for building
ADD . /api/build
# Build for release
RUN pnpm prisma generate && \
    pnpm build 


FROM base as release
# Node Env
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# Copy pnpm-lock for installing deps
COPY pnpm-lock.yaml package.json ./
# Copy from build
COPY prisma/schema.prisma ./
COPY --from=build /api/build/dist ./dist
# Install prod dependencies
RUN pnpm install --production && \
    pnpm prisma generate
# Expose the port
EXPOSE 3000
# Run the server
CMD ["pnpm", "start:prod"]
