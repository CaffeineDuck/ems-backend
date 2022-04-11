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
        process.env.TWILIO_ACCOUNT_SID || 'AC307783230d8fff454f2e44a12c0beac7',
      authToken:
        process.env.TWILIO_AUTH_TOKEN || '289671ef73794f829024fa596eaeee26',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '+17076827899',
    },
  } as IConfig);
