export class UserVerificationStatus {
  id: string;
  onBoarded: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  userProfile: {
    verified: boolean;
  } | null;
}
