ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT unique_email UNIQUE (email);