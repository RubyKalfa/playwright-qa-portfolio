# Verified local results

Verification date: 2 November 2026.

- `npm run typecheck`: passed.
- `npx playwright test --list`: discovered 29 executions across four projects.
- `npm test`: **29 passed in 25.5 seconds**, with zero retries locally.
- API: 11 passed.
- Chromium UI: 6 passed.
- Firefox UI: 6 passed.
- WebKit UI: 6 passed.
- Dependency install audit: 0 vulnerabilities reported at installation time.

Environment: macOS, Node.js 24.22.1, Playwright 1.64.1, TypeScript 7.0.2. Dependencies are pinned in package.json and package-lock.json.

The first API run exposed a test request construction error: a string body was serialized as a JSON string instead of being sent as malformed raw JSON. The request now sends a Buffer; the complete final run passed. This was a test correction, not a relaxed application assertion.

These local results were recorded before publication. The project is now published at https://github.com/RubyKalfa/playwright-qa-portfolio. See its Actions tab for the current hosted CI result.

The delivered ZIP contains source and documentation, without dependency folders, generated reports, or local Git metadata. The final HTML report is delivered separately. Reproduce it with `npm ci`, browser installation, and `npm test` as described in the README.

## Hosted verification

The first GitHub Actions run completed successfully on 2 November 2026, including type checking and the full test suite.

Run: https://github.com/RubyKalfa/playwright-qa-portfolio/actions/runs/41505041205
