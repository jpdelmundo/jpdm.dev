#!/bin/bash
docker exec -t db pg_dump -U postgres -d jpdm -s \
  --no-owner --no-privileges --no-comments \
  --no-publications --no-subscriptions --no-security-labels \
  2>/dev/null \
  | sed '/^\\restrict /,/^\\unrestrict /{/^\\unrestrict /d; /^\\restrict /d;}' \
  > backend/migrations/000_init.sql