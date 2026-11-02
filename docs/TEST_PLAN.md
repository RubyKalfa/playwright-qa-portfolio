# Test plan

## Objective

Check that users can manage issue records and that invalid requests do not corrupt stored state. Prioritize persistence, accurate filtering, data separation, and useful failure recovery.

## Coverage map

| Risk | Check | Layer |
| --- | --- | --- |
| A new issue appears only in the UI | Create, reload, inspect through API | UI + API |
| Status updates are lost | Patch/read and browser reload | Both |
| Deleted issues return | Delete, reload, assert API 404 | Both |
| Bad input enters the collection | Empty, whitespace, 121-character title; invalid priority | API |
| Valid boundary input is rejected | 120-character title with surrounding whitespace | API |
| Invalid status corrupts data | Invalid patch followed by unchanged record check | API |
| Broken payload crashes the handler | Malformed JSON returns 400 | API |
| Parallel tests affect one another | Random workspaces; explicit separation test | Fixtures + API |
| Service failure leaves UI unusable | Intercept create with 503; check error; remove interception; retry | UI |
| User-entered markup becomes HTML | Literal rendering with no created image element | UI |

## Execution

Run the smoke group during development and all projects before merging. The browser UI cases execute on Chromium, Firefox, and WebKit; API cases execute once in the API project. CI uses the committed dependency lockfile, type checks the code, and uploads reports after the run.

A passing run requires all selected tests to pass. Inspect retry outcomes and failure traces before treating a CI failure as transient. Do not update assertions merely to hide a regression.

## Not covered

Production identity and access control, a real database, load/performance, real mobile hardware, comprehensive accessibility, visual comparisons, and external integrations. These would need separate requirements and test environments.
