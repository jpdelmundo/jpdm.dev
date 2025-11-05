#!/bin/bash
#run in project root
TS=$(date +%Y%m%d_%H%M%S)
docker exec -t pgdb pg_dump -U postgres jpdm > ./db/backup/jpdm_${TS}.sql
docker exec -t pgdb pg_dump -U postgres --schema-only jpdm > ./db/backup/jpdm_schema_${TS}.sql