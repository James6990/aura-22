# Apex Patch History

This file records every substantial Apex build patch and its verification status.

| Date | Patch | Milestone | Status | Commit | Checkpoint Tag | Notes |
|---|---|---|---|---|---|---|
| 2026-08-04 | apex-decision-context-v1.sh | Unified Apex Decision Context v1 | Passed | See Git history | checkpoint-decision-context-v1 | Added shared decision context and tests. |
| 2026-08-04 | apex-decision-context-v2-foundation.sh | Decision Evidence and Reasoning Foundation | Passed | See Git history | checkpoint-decision-reasoning-v1 | Added evidence registry, decision traces, confidence and explanations. |

| 2026-08-04 | github-actions-apex-check-v1.sh | Automatic GitHub Apex verification | Applied, awaiting CI | Pending | Pending | Adds push, pull-request and manual Apex checks. |

| 2026-08-04 | apex-build-plan-v1.sh | Living Apex build plan | Applied | Pending | Pending | Adds the project roadmap, milestone order and verification requirements. |

## Patch Rules

- Apply patches only from the dedicated Apex/Build-Patches folder.
- Start from a clean Git working tree.
- Review git diff before testing.
- Run npm run apex:check before committing.
- Commit and tag only after all checks pass.
- Never let a patch commit automatically.

## Current Next Patch

Decision Trace Integration v1
