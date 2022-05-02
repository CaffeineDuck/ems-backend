export default () =>
  ({
    server: {
      port: +(process.env.PORT || '3000'),
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'jwtSecret',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '14d',
    },
    twilio: {
      accountSid:
        process.env.TWILIO_ACCOUNT_SID || 'ACc176128903e7465d7bc748907065fcde',
      authToken:
        process.env.TWILIO_AUTH_TOKEN || 'edcbd71c2e1d15dc5b218ee16bb322af',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '+15005550006',
    },
    geolocation: {
      radius: +(process.env.GEOLOCATION_RADIUS || '15000'),
    },
  } as IConfig);
