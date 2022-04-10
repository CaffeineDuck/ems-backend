FROM node:16.10.0

# Install pnpm
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm

# Set the workdir
WORKDIR /server

# Install packages
COPY pnpm-lock.yaml /server
RUN pnpm fetch --prod

ADD . /server
RUN pnpm install 

RUN chmod +x entrypoint.sh
ENTRYPOINT ["sh", "entrypoint.sh"]

