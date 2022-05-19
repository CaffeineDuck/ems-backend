FROM node:16.10.0-alpine as base
# Set workdir
WORKDIR /api
# Install curl and pnpm
RUN wget -qO- https://unpkg.com/@pnpm/self-installer | node 


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
    pnpm build && \
    pnpm prune --prod


FROM base as release
# Node Env
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# Install Doppler CLI
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler
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
ENTRYPOINT ["doppler", "run", "--"]
CMD ["pnpm", "start:prod"]
