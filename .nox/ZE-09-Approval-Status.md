# ZE-09 — Current approval evidence, 2026-10-24

State: WAITING_USER_ACTION. Google Business Profile API approval is **not confirmed**. No rejection is claimed either.

The owner clarified that the received approval email/screenshot was from **Meta Business Portfolio**, and had been confused with Google approval. Meta's approval does not authorize Google Business Profile APIs. The owner subsequently confirmed the Google request used **omnyatech@gmail.com**, whereas the connected Gmail account is **yanoliveiragm@gmail.com**. Read-only searches in that connected account found no matching approval; they do not verify the request mailbox and do not prove absence of Google approval. No connection to the request mailbox is available here.

Existing project: `zelo-integracoes` / `878742106609`. Previously owner-reported request protocol: `1-7339000042113`. Do not create a replacement project or duplicate access request.

Local inspection was limited to variable names and nonempty-presence flags. The five required Google variables are currently absent: `GOOGLE_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_LOCATION_ID`, `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET`, `GOOGLE_BUSINESS_REFRESH_TOKEN`. No credential values were shown, recorded or committed. The real local Functions endpoint returns sanitized HTTP503/configuration; the Instagram Functions endpoint returns HTTP200 with six posts.

## How the owner can establish the Google gate

1. Open **omnyatech@gmail.com**, the account/mailbox used for the original Business Profile API access request. Search for the exact project number and protocol above, plus Google Business Profile/API access approval. Check replies/spam as appropriate; do not send access tokens or passwords in chat.
2. In [Google Cloud Console](https://console.cloud.google.com/apis/dashboard?project=zelo-integracoes), confirm the selected existing project and inspect the Business Profile API availability/quota. The [official prerequisites](https://developers.google.com/my-business/content/prereqs) explain that access approval and a quota above zero are separate from simply creating the project. A zero quota requires resolving the existing access request with Google, not a new project or billing activation.
3. If approval is evidenced, follow [ZE-09.1-Google-Handoff.md](ZE-09.1-Google-Handoff.md) and the original ZE-09 handoff to establish authorized owner/Profile permission, OAuth, exact account/location IDs and server-only secrets. Approval itself does not configure these.
4. Once configured locally, restart the existing local runtime and verify genuine business identity, average/count/reviews and official links. The frontend already consumes that authorized endpoint without code changes. Do not mark the real integration PASS based on TEST DATA captures.

No Google Cloud account was changed, no API/billing enabled, no application submitted, and no production deployment performed. The current exact external condition is **approval unconfirmed and local Google configuration absent**; earlier statements about an ongoing Google analysis are owner-reported history rather than a newly observed Google decision.
