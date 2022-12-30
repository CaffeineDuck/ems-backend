## EMS

This is the backend for ems made using **NestJs**.

## Installation

- Git clone the repo
```bash
gh repo clone CaffeineDuck/ems-backend
```

- Install the dependencies using pnpm
```bash
pnpm install
```

- Use [doppler](https://www.doppler.com/) for your env vars, or use .env.
<details>
  <summary> Environment Variables </summary>
  
   ```bash
   AWS_SECRET_ACCESS_KEY=
   AWS_SECRET_KEY_ID=
   DATABASE_URL=
   JWT_EXPIRES_IN=
   JWT_REFRESH_EXPIRES_IN=
   JWT_SECRET=
   NODE_ENV=
   PUSHER_INSTANCE_ID=
   PUSHER_KEY=
   REDIS_HOST=
   REDIS_PORT=
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_PHONE_NUMBER=
   ```
</details>
       
- Make sure you have a **AWS** account with an s3 bucked named `ems-dev`.
- Make sure you have a **Twilio** account.
- Make sure you have a **pusher** account.



## Running the app

<details>
  <summary> Without Docker (Recommended) </summary>

  ### Running it (w/o docker)

  **Pre Requisite**
  - Make sure you have used `doppler` or populated the env vars with required info
  - Make sure you have `postgres`, `redis` up and running

  ```bash
  # development
  pnpm start
  
  # watch mode
  pnpm start:dev

  # production mode
  pnpm start:prod
  ```
</details>

<details>
  <summary> With docker </summary>
  
  ### Running it (with docker)

  **Note:** Running it using docker maynot be fully stable currently. So don't use `Dockerfile.local` and `docker-compose.yml`.
  
  - Start a `postgres` container with required environment vars, and update those vars in `doppler` (**`.env` isn't supported yet**).
  - Start a `redis` container and do the same as above.
  - Build the image from `Dockerfile`.
  - Run the container from the above image and pass your doppler token as environment variable.
  ```bash
  docker run -e DOPPLER_TOKEN="$DOPPLER_TOKEN" your-application
  ```

</details>
