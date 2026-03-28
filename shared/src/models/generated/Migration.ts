/** Identifier type for migrations */
export type MigrationId = number & { __flavor?: 'MigrationId' };

/** Represents the table public.migrations */
export interface Migration {
  id: MigrationId;

  name: string;

  applied_at: Date | null;
}

/** Represents the table public.migrations */
export interface MigrationInitializer {
  /** Default value: nextval('migrations_id_seq'::regclass) */
  id?: MigrationId;

  name: string;

  /** Default value: now() */
  applied_at?: Date | null;
}

/** Represents the table public.migrations */
export interface MigrationMutator {
  id?: MigrationId;

  name?: string;

  applied_at?: Date | null;
}

export const MigrationColumns = [
  "id",
  "name",
  "applied_at",
] as const;