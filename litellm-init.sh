#!/bin/sh
KEY_VALUE="${LITELLM_VIRTUAL_KEY}"
MASTER_KEY="${LITELLM_MASTER_KEY}"
PROXY_URL="${LITELLM_API_BASE_URL}"

while ! curl -s "$PROXY_URL/health" >/dev/null 2>&1; do
  echo "Waiting for LiteLLM..."
  sleep 2
done

echo "Checking if virtual key already exists..."

# Try to create the key - if it already exists, this is a no-op
RESPONSE=$(curl -s -X POST "$PROXY_URL/key/generate" \
  -H "Authorization: Bearer $MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"$KEY_VALUE\",
    \"models\": [\"moderation-model\"],
    \"key_alias\": \"jpdm-key\"
  }")

echo "Key init response: $RESPONSE"