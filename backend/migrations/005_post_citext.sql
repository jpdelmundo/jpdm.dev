ALTER TABLE public.posts
    ALTER COLUMN title TYPE citext COLLATE pg_catalog."default";

ALTER TABLE public.posts
    ALTER COLUMN content TYPE citext COLLATE pg_catalog."default";