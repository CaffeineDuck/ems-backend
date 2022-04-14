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

interface IConfig {
  jwt: IJwtConfig;
  server: IServerConfig;
  twilio: ITwilioConfig;
}
