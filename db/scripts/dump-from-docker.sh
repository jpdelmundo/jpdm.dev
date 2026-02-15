#!/bin/bash
docker exec -t db pg_dump -U postgres -d jpdm -s \
  --no-owner --no-privileges --no-comments \
  --no-publications --no-subscriptions --no-security-labels \
  -T 'public.migrations' \
  -T 'public.migrations_id_seq' \
  2>/dev/null \
  > backend/migrations/000_init.sql