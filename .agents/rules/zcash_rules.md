---
trigger: always_on
description: Mandatory rules and zero-knowledge privacy standards for the ZecWhisper project.
---

# Zcash Development & Privacy Rules

When working on this repository, you must strictly follow these rules:

1. **Strictly Orchard / Unified Addresses Only:**
   - Never generate or accept transparent `t-addresses` (`t1...`, `t3...`).
   - All addresses must be Orchard Unified Addresses (`u1...`).

2. **Zero Metadata Leaks:**
   - Do not add third-party analytics (Google Analytics, Mixpanel, etc.).
   - Do not log sensitive user inputs or IP addresses.
   - Senders must be able to use the drop portal completely anonymously without creating an account.

3. **Key Safety Isolation:**
   - Never prompt for spending keys (`sk`) or seed phrases.
   - Only support **Incoming Viewing Keys (`ivk`)** for recipient scanning.

4. **Reliability & "Working Beats Ambitious":**
   - Provide clean error boundaries and fallback demo states for all network calls to ensure judges can always test the UI without needing active testnet funds.
