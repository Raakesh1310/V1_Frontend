import { UserProfile } from '@modules/profile/models';

export interface User extends UserBasic, UserSystemSpecific {
  [key: string]: string | number | boolean | UserProfile | User;

  id: string;

  profile: UserProfile;
}

/**
 * Basic Info
 */
export interface UserBasic {
  fullName: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
}

/**
 * System Specific
 */
export interface UserSystemSpecific {
  password: string;
  role: string;
  salt: string;
  image: string;
  createdBy: User;
  active: boolean;
  kycVerified: boolean;
}
