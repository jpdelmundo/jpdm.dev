/** Identifier type for user_profiles */
export type UserProfileId = string & { __flavor?: 'UserProfileId' };

/** Represents the table public.user_profiles */
export interface UserProfile {
  id: UserProfileId;

  user_id: string;

  avatar_url: string | null;

  date_of_birth: Date | null;

  bio: string | null;

  phone_number: string | null;

  created_at: Date;

  updated_at: Date | null;

  first_name: string | null;

  last_name: string | null;

  gender: string | null;

  avatar_file_id: string | null;
}

/** Represents the table public.user_profiles */
export interface UserProfileInitializer {
  /** Default value: gen_random_uuid() */
  id?: UserProfileId;

  user_id: string;

  avatar_url?: string | null;

  date_of_birth?: Date | null;

  bio?: string | null;

  /** Default value: NULL::bpchar */
  phone_number?: string | null;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;

  /** Default value: NULL::character varying */
  first_name?: string | null;

  /** Default value: NULL::character varying */
  last_name?: string | null;

  gender?: string | null;

  avatar_file_id?: string | null;
}

/** Represents the table public.user_profiles */
export interface UserProfileMutator {
  id?: UserProfileId;

  user_id?: string;

  avatar_url?: string | null;

  date_of_birth?: Date | null;

  bio?: string | null;

  phone_number?: string | null;

  created_at?: Date;

  updated_at?: Date | null;

  first_name?: string | null;

  last_name?: string | null;

  gender?: string | null;

  avatar_file_id?: string | null;
}

export const UserProfileColumns = [
  "id",
  "user_id",
  "avatar_url",
  "date_of_birth",
  "bio",
  "phone_number",
  "created_at",
  "updated_at",
  "first_name",
  "last_name",
  "gender",
  "avatar_file_id",
] as const;