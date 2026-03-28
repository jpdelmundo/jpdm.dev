-- Rename comments table to post_comments
ALTER TABLE public.comments RENAME TO post_comments;

-- Rename images table to post_images
ALTER TABLE public.images RENAME TO post_images;

-- Rename primary key constraint for images (currently post_files_pkey)
ALTER TABLE public.post_images DROP CONSTRAINT IF EXISTS post_files_pkey;
ALTER TABLE public.post_images ADD CONSTRAINT post_images_pkey PRIMARY KEY (id);