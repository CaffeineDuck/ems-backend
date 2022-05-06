interface IJwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

interface IServerConfig {
  port: number;
}

interface ITwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface IGeolocationConfig {
  radius: number;
}

interface IAwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  s3: {
    bucket: string;
    region: string;
  };
}

interface IConfig {
  jwt: IJwtConfig;
  server: IServerConfig;
  twilio: ITwilioConfig;
  geolocation: IGeolocationConfig;
  aws: IAwsConfig;
}
