# HaviFlow — Demo Script (~2 minutes)

1. **[0:00]** Landing on a phone-width window → "Register with Face Verification" → type 3 fields → live face scan → profile auto-fills, every field locked "Managed by eGovPH". Say: *"Real eVerify + Face Liveness — Once-Only Policy in action."* Judge's phone buzzes: welcome SMS. *(Real eMessage.)*
2. **[0:40]** Roadmap: summary bar "₱4,835 · 6 weeks · 3 office visits". Open Medical Certificate → form already filled → note the amber banner → Submit → confetti → SMS buzzes with reference number.
3. **[1:20]** Chat chip: "What happens after my student permit?" → grounded answer. *(Real eGov AI, stateless — no data hoarding.)*
4. **[1:45]** Close: *"Identity, SMS, and AI are live government APIs. LTO submission is sandboxed and labeled — the roadmap engine treats any agency as a new node type. That's the roadmap-to-everything."*

## Pre-demo checklist

- [ ] Rehearse once with all `*_MOCK=true` (backup show), then set the real flags.
- [ ] Check `http://localhost:3000/admin` for token health + AI credits.
- [ ] Charge the SMS demo phone.
- [ ] Secret-leak check: `grep -ri "PARTNER_SECRET\|CLIENT_SECRET\|ACCESS_CODE\|EMESSAGE_TOKEN" frontend/.next` should return nothing.
