ALTER TABLE post_comments
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ai_approved',
  ADD COLUMN moderation_notes TEXT;

ALTER TABLE post_comments
  ADD CONSTRAINT post_comments_status_check
  CHECK (status IN ('ai_approved', 'ai_rejected', 'user_approved', 'user_rejected'));
