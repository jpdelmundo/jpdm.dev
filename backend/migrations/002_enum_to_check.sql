-- Convert user_roles.role from enum to VARCHAR with check constraint
-- First drop the default which references the enum type
ALTER TABLE user_roles ALTER COLUMN role DROP DEFAULT;

-- Then alter the column type
ALTER TABLE user_roles
  ALTER COLUMN role TYPE VARCHAR(20) USING role::text;

-- Set new default as plain string
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'user';

-- Add check constraint
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'user'));

-- Convert posts.visibility from enum to VARCHAR with check constraint
-- First drop the default which references the enum type
ALTER TABLE posts ALTER COLUMN visibility DROP DEFAULT;

-- Then alter the column type
ALTER TABLE posts
  ALTER COLUMN visibility TYPE VARCHAR(20) USING visibility::text;

-- Set new default as plain string
ALTER TABLE posts ALTER COLUMN visibility SET DEFAULT 'public';

-- Add check constraint
ALTER TABLE posts
  ADD CONSTRAINT posts_visibility_check
  CHECK (visibility IN ('public', 'private'));

-- Drop the unused enum types
DROP TYPE public.user_role;
DROP TYPE public.visibility;