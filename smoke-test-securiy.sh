#!/usr/bin/env bash
# Komit Part 2 — JWT security smoke test
# Requires: curl, jq
# Usage: JWT_SECRET=<your-secret> first run the app, then ./smoke-test-security.sh
# Assumes server running at http://localhost:8080 with the seeded ARTIST user.

set -u

BASE="http://localhost:8080"
API="$BASE/api"
RUN_ID=$(date +%s)

# artist seed creds — override via env if you changed them
ARTIST_EMAIL="${ARTIST_EMAIL:-artist@komit.local}"
ARTIST_PASSWORD="${ARTIST_PASSWORD:-changeme123}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
pass() { echo -e "${GREEN}✓ PASS${NC} $1"; }
fail() { echo -e "${RED}✗ FAIL${NC} $1"; echo "  detail: $2"; exit 1; }
info() { echo -e "${BLUE}→${NC} $1"; }
section() { echo -e "\n${YELLOW}── $1 ──${NC}"; }

# helper: returns HTTP status code only
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
# helper: returns body only
body() { curl -s "$@"; }

# ─────────────────────────────────────────────────────────────────
section "0. Server reachable (auth endpoint should be public)"
# ─────────────────────────────────────────────────────────────────
HEALTH=$(code -X POST "$API/auth/login" -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"short"}')
# we don't care about the exact code here (400/401), just that it's not a connection failure
if [ "$HEALTH" = "000" ]; then
  fail "Server not reachable at $BASE" "is the app running with JWT_SECRET set?"
fi
pass "Server reachable (auth endpoint responding)"

# ─────────────────────────────────────────────────────────────────
section "2. Signup — creates User+Client, returns token"
# ─────────────────────────────────────────────────────────────────
CLIENT_A_EMAIL="clientA_${RUN_ID}@test.com"
SIGNUP_A=$(body -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CLIENT_A_EMAIL\",\"password\":\"password123\",\"name\":\"Client A $RUN_ID\",\"contact\":\"discord:clientA\"}")
CLIENT_A_TOKEN=$(echo "$SIGNUP_A" | jq -r '.token // empty')
CLIENT_A_CLIENTID=$(echo "$SIGNUP_A" | jq -r '.clientId // empty')
CLIENT_A_ROLE=$(echo "$SIGNUP_A" | jq -r '.role // empty')
[ -z "$CLIENT_A_TOKEN" ] && fail "Signup did not return a token" "$SIGNUP_A"
pass "Client A signed up (clientId=$CLIENT_A_CLIENTID, role=$CLIENT_A_ROLE)"
[ "$CLIENT_A_ROLE" = "CLIENT" ] && pass "Signup role is CLIENT" || fail "Expected role CLIENT, got '$CLIENT_A_ROLE'" "$SIGNUP_A"
[ -n "$CLIENT_A_CLIENTID" ] && [ "$CLIENT_A_CLIENTID" != "null" ] && pass "Signup created linked Client" || fail "No clientId on signup" "$SIGNUP_A"

# second client for ownership tests
CLIENT_B_EMAIL="clientB_${RUN_ID}@test.com"
SIGNUP_B=$(body -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CLIENT_B_EMAIL\",\"password\":\"password123\",\"name\":\"Client B $RUN_ID\",\"contact\":\"discord:clientB\"}")
CLIENT_B_TOKEN=$(echo "$SIGNUP_B" | jq -r '.token // empty')
CLIENT_B_CLIENTID=$(echo "$SIGNUP_B" | jq -r '.clientId // empty')
[ -z "$CLIENT_B_TOKEN" ] && fail "Client B signup failed" "$SIGNUP_B"
info "Client B signed up (clientId=$CLIENT_B_CLIENTID) for ownership tests"

# ─────────────────────────────────────────────────────────────────
section "3. Duplicate email → 409"
# ─────────────────────────────────────────────────────────────────
DUP_CODE=$(code -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CLIENT_A_EMAIL\",\"password\":\"password123\",\"name\":\"dup\",\"contact\":\"x\"}")
[ "$DUP_CODE" = "409" ] && pass "Duplicate email rejected with 409" || fail "Expected 409, got $DUP_CODE" "duplicate signup"

# ─────────────────────────────────────────────────────────────────
section "4. Artist login → 200 with role ARTIST"
# ─────────────────────────────────────────────────────────────────
LOGIN_ARTIST=$(body -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ARTIST_EMAIL\",\"password\":\"$ARTIST_PASSWORD\"}")
ARTIST_TOKEN=$(echo "$LOGIN_ARTIST" | jq -r '.token // empty')
ARTIST_ROLE=$(echo "$LOGIN_ARTIST" | jq -r '.role // empty')
[ -z "$ARTIST_TOKEN" ] && fail "Artist login failed — is the seed user present?" "$LOGIN_ARTIST"
pass "Artist logged in"
[ "$ARTIST_ROLE" = "ARTIST" ] && pass "Artist role is ARTIST" || fail "Expected ARTIST, got '$ARTIST_ROLE'" "$LOGIN_ARTIST"
ARTIST_CLIENTID=$(echo "$LOGIN_ARTIST" | jq -r '.clientId')
[ "$ARTIST_CLIENTID" = "null" ] && pass "Artist has null clientId (correct)" || info "Artist clientId=$ARTIST_CLIENTID (expected null)"

# ─────────────────────────────────────────────────────────────────
section "5. Wrong password → 401"
# ─────────────────────────────────────────────────────────────────
WRONG_CODE=$(code -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ARTIST_EMAIL\",\"password\":\"definitely-wrong\"}")
[ "$WRONG_CODE" = "401" ] && pass "Wrong password rejected with 401" || fail "Expected 401, got $WRONG_CODE" "bad creds"

# ─────────────────────────────────────────────────────────────────
section "6. No token on protected route → 401"
# ─────────────────────────────────────────────────────────────────
NOTOKEN_CODE=$(code "$API/commissions")
[ "$NOTOKEN_CODE" = "401" ] && pass "No token → 401" || fail "Expected 401, got $NOTOKEN_CODE" "missing token should be rejected"

# ─────────────────────────────────────────────────────────────────
section "6b. Garbage token → 401"
# ─────────────────────────────────────────────────────────────────
GARBAGE_CODE=$(code "$API/commissions" -H "Authorization: Bearer not.a.real.token")
[ "$GARBAGE_CODE" = "401" ] && pass "Invalid token → 401" || fail "Expected 401, got $GARBAGE_CODE" "garbage token should be rejected"

# ─────────────────────────────────────────────────────────────────
section "Setup: ARTIST creates prerequisites + a commission for Client A"
# ─────────────────────────────────────────────────────────────────
# commission type
TYPE_RESP=$(body -X POST "$API/commission-types" \
  -H "Authorization: Bearer $ARTIST_TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Illustration $RUN_ID\",\"description\":\"test\",\"basePrice\":80.00}")
TYPE_ID=$(echo "$TYPE_RESP" | jq -r '.id // empty')
[ -z "$TYPE_ID" ] && fail "Artist could not create commission type" "$TYPE_RESP"
info "CommissionType created (id=$TYPE_ID)"

# commission for client A
COMM_A=$(body -X POST "$API/commissions" \
  -H "Authorization: Bearer $ARTIST_TOKEN" -H "Content-Type: application/json" \
  -d "{\"title\":\"Comm for A $RUN_ID\",\"clientId\":$CLIENT_A_CLIENTID,\"commissionTypeId\":$TYPE_ID,\"agreedPrice\":100.00,\"currency\":\"USD\"}")
COMM_A_ID=$(echo "$COMM_A" | jq -r '.id // empty')
[ -z "$COMM_A_ID" ] && fail "Artist could not create commission for A" "$COMM_A"
pass "ARTIST created commission $COMM_A_ID for Client A"

# commission for client B
COMM_B=$(body -X POST "$API/commissions" \
  -H "Authorization: Bearer $ARTIST_TOKEN" -H "Content-Type: application/json" \
  -d "{\"title\":\"Comm for B $RUN_ID\",\"clientId\":$CLIENT_B_CLIENTID,\"commissionTypeId\":$TYPE_ID,\"agreedPrice\":50.00,\"currency\":\"USD\"}")
COMM_B_ID=$(echo "$COMM_B" | jq -r '.id // empty')
[ -z "$COMM_B_ID" ] && fail "Artist could not create commission for B" "$COMM_B"
info "ARTIST created commission $COMM_B_ID for Client B"

# ─────────────────────────────────────────────────────────────────
section "8. CLIENT POST commission → 403 (role-based)"
# ─────────────────────────────────────────────────────────────────
CLIENT_POST_CODE=$(code -X POST "$API/commissions" \
  -H "Authorization: Bearer $CLIENT_A_TOKEN" -H "Content-Type: application/json" \
  -d "{\"title\":\"hax\",\"clientId\":$CLIENT_A_CLIENTID,\"commissionTypeId\":$TYPE_ID,\"agreedPrice\":1}")
[ "$CLIENT_POST_CODE" = "403" ] && pass "CLIENT blocked from creating commission (403)" || fail "Expected 403, got $CLIENT_POST_CODE" "role-based auth failed"

# ─────────────────────────────────────────────────────────────────
section "9. ARTIST POST commission → 201 (already verified in setup, confirming explicitly)"
# ─────────────────────────────────────────────────────────────────
ARTIST_POST_CODE=$(code -X POST "$API/commissions" \
  -H "Authorization: Bearer $ARTIST_TOKEN" -H "Content-Type: application/json" \
  -d "{\"title\":\"Comm extra $RUN_ID\",\"clientId\":$CLIENT_A_CLIENTID,\"commissionTypeId\":$TYPE_ID,\"agreedPrice\":100}")
[ "$ARTIST_POST_CODE" = "201" ] && pass "ARTIST can create commission (201)" || fail "Expected 201, got $ARTIST_POST_CODE" "artist write blocked unexpectedly"

# ─────────────────────────────────────────────────────────────────
section "7. CLIENT GET /commissions → only their own"
# ─────────────────────────────────────────────────────────────────
CLIENT_A_LIST=$(body "$API/commissions" -H "Authorization: Bearer $CLIENT_A_TOKEN")
# every returned commission must belong to client A
FOREIGN_COUNT=$(echo "$CLIENT_A_LIST" | jq "[.[] | select(.client.id != $CLIENT_A_CLIENTID and .clientId != $CLIENT_A_CLIENTID)] | length" 2>/dev/null || echo "parse_error")
A_LIST_COUNT=$(echo "$CLIENT_A_LIST" | jq 'length' 2>/dev/null || echo "?")
if [ "$FOREIGN_COUNT" = "0" ]; then
  pass "Client A list contains only their own commissions ($A_LIST_COUNT total)"
elif [ "$FOREIGN_COUNT" = "parse_error" ]; then
  info "Could not auto-verify ownership shape — inspect manually:"
  echo "$CLIENT_A_LIST" | jq '.[] | {id, clientId, client: .client.id}' 2>/dev/null | head -20
  fail "Response shape unexpected for ownership check" "see above"
else
  fail "Client A sees $FOREIGN_COUNT commissions that aren't theirs (LEAK!)" "$CLIENT_A_LIST"
fi

# ─────────────────────────────────────────────────────────────────
section "10. CLIENT A accessing CLIENT B's commission by id → 404"
# ─────────────────────────────────────────────────────────────────
CROSS_CODE=$(code "$API/commissions/$COMM_B_ID" -H "Authorization: Bearer $CLIENT_A_TOKEN")
[ "$CROSS_CODE" = "404" ] && pass "Cross-client access blocked with 404 (no existence leak)" \
  || fail "Expected 404, got $CROSS_CODE — ownership check failed (possible data leak)" "Client A reached Client B's commission $COMM_B_ID"

# and confirm A CAN see their own
OWN_CODE=$(code "$API/commissions/$COMM_A_ID" -H "Authorization: Bearer $CLIENT_A_TOKEN")
[ "$OWN_CODE" = "200" ] && pass "Client A can access their own commission (200)" || fail "Expected 200, got $OWN_CODE" "client locked out of own data"

# ─────────────────────────────────────────────────────────────────
section "11. ARTIST Part-1 business rules still work (cancel)"
# ─────────────────────────────────────────────────────────────────
CANCEL_RESP=$(body -X POST "$API/commissions/$COMM_B_ID/cancel" \
  -H "Authorization: Bearer $ARTIST_TOKEN" -H "Content-Type: application/json" \
  -d '{"reason":"smoke test"}')
CANCEL_STATUS=$(echo "$CANCEL_RESP" | jq -r '.status // empty')
[ "$CANCEL_STATUS" = "CANCELLED" ] && pass "Part 1 cancel still works for ARTIST" || fail "Cancel failed, got status '$CANCEL_STATUS'" "$CANCEL_RESP"

# ─────────────────────────────────────────────────────────────────
section "BONUS: CLIENT can create a revision on their OWN commission's milestone"
# ─────────────────────────────────────────────────────────────────
# get a milestone from client A's commission
A_COMM_DETAIL=$(body "$API/commissions/$COMM_A_ID" -H "Authorization: Bearer $CLIENT_A_TOKEN")
A_MILESTONE_ID=$(echo "$A_COMM_DETAIL" | jq -r '.milestones | sort_by(.orderIndex) | .[0].id // empty')
if [ -n "$A_MILESTONE_ID" ] && [ "$A_MILESTONE_ID" != "null" ]; then
  REV_CODE=$(code -X POST "$API/milestones/$A_MILESTONE_ID/revisions" \
    -H "Authorization: Bearer $CLIENT_A_TOKEN" -H "Content-Type: application/json" \
    -d '{"feedbackText":"can you adjust the pose?"}')
  if [ "$REV_CODE" = "200" ] || [ "$REV_CODE" = "201" ]; then
    pass "CLIENT can leave feedback on their own milestone ($REV_CODE)"
  else
    info "CLIENT revision on own milestone returned $REV_CODE (check if this matches your intended rule)"
  fi

  # and CANNOT on client B's milestone
  B_COMM_DETAIL=$(body "$API/commissions/$COMM_B_ID" -H "Authorization: Bearer $ARTIST_TOKEN")
  B_MILESTONE_ID=$(echo "$B_COMM_DETAIL" | jq -r '.milestones | sort_by(.orderIndex) | .[0].id // empty')
  if [ -n "$B_MILESTONE_ID" ] && [ "$B_MILESTONE_ID" != "null" ]; then
    CROSS_REV_CODE=$(code -X POST "$API/milestones/$B_MILESTONE_ID/revisions" \
      -H "Authorization: Bearer $CLIENT_A_TOKEN" -H "Content-Type: application/json" \
      -d '{"feedbackText":"hax attempt"}')
    [ "$CROSS_REV_CODE" = "404" ] || [ "$CROSS_REV_CODE" = "403" ] \
      && pass "CLIENT A blocked from feedback on Client B's milestone ($CROSS_REV_CODE)" \
      || fail "Expected 403/404, got $CROSS_REV_CODE — ownership leak on revision create" "milestone $B_MILESTONE_ID"
  fi
else
  info "No milestone found on Client A's commission — skipping revision ownership test"
fi

# ─────────────────────────────────────────────────────────────────
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  All security smoke tests passed 🫡${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Tokens for manual poking:${NC}"
echo "  ARTIST_TOKEN=$ARTIST_TOKEN"
echo "  CLIENT_A_TOKEN=$CLIENT_A_TOKEN"
