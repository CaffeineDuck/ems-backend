class Profile {
  id: number;
  name: string;
  address: string;
  verified: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile {
  id: string;
  phoneNumber: string;
  userProfile: Profile | null;
  createdAt: Date;
  updatedAt: Date;
}
