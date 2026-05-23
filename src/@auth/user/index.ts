import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import { FuseAuthUser } from '@fuse/core/FuseAuthProvider/types/FuseAuthUser';
import { PartialDeep } from 'type-fest';

/**
 * The type definition for a user object.
 */
export type User = FuseAuthUser & {
  uid: string;
  role: string[] | string | null;
  data: {
    displayName: string;
    photoURL?: string;
    email?: string;
    masterEmail?: string;
    shortcuts?: string[];
    settings?: PartialDeep<FuseSettingsConfigType>;
    loginRedirectUrl?: string; // The URL to redirect to after login.
  };
};
