# AI Collaboration Contract

Read `docs/PROJECT_SUMMARY.md`, then `AI_HANDOFF.md`, before exploring the tree.
Treat those files as the shared context for Codex and Claude.

## Work rules

- One assistant owns a task at a time. Do not duplicate an active task.
- Inspect only files named in the task or handoff; expand scope only when evidence requires it.
- Preserve unrelated local changes. Never commit secrets, `.env` files, PII, or generated contact lists.
- Before editing, record the task and owner in `AI_HANDOFF.md`. On completion, replace it with a concise result, files changed, checks run, and next action.
- Prefer the smallest correct patch. Do not rewrite working areas for style alone.
- Run targeted tests first. For a broad change, run `npm test`, `npm run build`, and `npm run lint`.
- Do not push, deploy, send email, charge Stripe, or mutate production data without explicit user approval.
- Never place credentials in Git remote URLs. Use a credential helper, SSH, or GitHub CLI.
- GitHub CLI is available locally at `./.codex-local/bin/gh`; its credentials live outside the repository.

## Cost discipline

- Do not ask a second model to re-review completed work unless the change is high-risk.
- Use `git diff`, this summary, and the handoff instead of rereading the repository.
- Keep handoffs factual and under 20 lines. Avoid pasting logs or entire files.
- Use one model for implementation and the other only for a distinct, explicitly assigned task.
