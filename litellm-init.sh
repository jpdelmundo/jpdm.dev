#!/bin/sh
KEY_VALUE="${LITELLM_VIRTUAL_KEY:-sk-masterkey}"
MASTER_KEY="${LITELLM_MASTER_KEY:-sk-virtualkey}"
PROXY_URL="${LITELLM_API_BASE_URL:-http://localhost:4000}"

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
    \"models\": [\"moderation-model\", \"vision-model\"],
    \"key_alias\": \"jpdm-key3\",
    \"max_budget\": 10.00,
    \"budget_duration\": \"monthly\"
  }")

echo "Key init response: $RESPONSE"