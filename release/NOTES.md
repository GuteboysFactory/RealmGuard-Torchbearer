Realm Guard / Torchbearer v1.9.0-qa.34 — Service UX Simplification.

- Removed the unreliable live Service counter and all associated observer/binding machinery.
- Service allocation remains dropdown-based and station-bounded.
- The Service step now clearly states the exact number of Service Checks to distribute.
- Specialty is explicitly explained as one additional check outside the Service total.
- Continue validation now gives directional feedback:
  - under allocation -> how many checks remain
  - over allocation -> how many checks to remove
- Structured Relationships from qa.32 remain unchanged.
- Smart relationship NPC generation remains unchanged.

QA: TEST_PROTOCOL_v1.9.0-qa.34.md
