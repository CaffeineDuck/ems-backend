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
   AWS_SECRET_ACCESS_KEY= # Secret access key from AWS IAM (required)
   AWS_SECRET_KEY_ID= # Secret key id from AWS IAM (required) 
   AWS_S3_BUCKET= # The name of the AWS s3 bucket (default: 'emistiri-dev')
   AWS_S3_REGION= # The region of your s3 bucket (default: 'ap-south-1')
   DATABASE_URL= # The database URI 
   JWT_EXPIRES_IN= # The time in which accessToken will expire (default: '1d')
   JWT_REFRESH_EXPIRES_IN=  # The time in which refreshToken will expire (default: '14d')
   JWT_SECRET= # The secret used for making accessToken and refreshToken (default: 'jwtSecret')
   NODE_ENV= # The node env (production | development | staging)
   PUSHER_INSTANCE_ID= # The instace id of pusher.js
   PUSHER_KEY= # The key for of pusher.js
   REDIS_HOST= # The host of redis instance (default: 'localhost')
   REDIS_PORT= # The port for redis instance (default: 6579)
   TWILIO_ACCOUNT_SID= # The account SID provided by twilio (required)
   TWILIO_AUTH_TOKEN= # The auth token provided by twilio (required)
   TWILIO_PHONE_NUMBER= # The phone number of twilio (required)
   GEOLOCATION_RADIUS= # The radius upto which businesses must be pinged after a request (default: 1500)
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
