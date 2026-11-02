# Playwright QA Portfolio

[![Playwright checks](https://github.com/RubyKalfa/playwright-qa-portfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/RubyKalfa/playwright-qa-portfolio/actions/workflows/playwright.yml)

An automation portfolio for a local issue tracker, using **Playwright and TypeScript**. It demonstrates UI workflows, direct REST API checks, boundary and negative testing, browser/API integration, test isolation, and continuous integration.

The application is a purpose-built practice system. This is a personal learning project, not an employer system or evidence of production deployment. No real customer data, credentials, or external demo services are used.

## Run it

Prerequisite: Node.js 24 LTS and npm.

```sh
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npm test
npm run report
```

On Linux, install browser system dependencies with `npx playwright install --with-deps chromium firefox webkit`.

Playwright starts and stops the demo server automatically. Port **4173** must be free. To explore the application manually, run `npm start` and open http://127.0.0.1:4173. Data stays in memory until the server stops; each browser stores its workspace ID in local storage.

## What is covered

| Area | Scenarios |
| --- | --- |
| UI | Create and reload, blank title validation, status changes and filtering, deletion, recovery from a simulated 503, safe rendering of HTML-like text |
| API | Create/read, update persistence, delete, blank/whitespace/overlong titles, 120-character boundary, invalid status, invalid priority, malformed JSON, workspace separation, missing workspace header |
| Integration | UI-created data checked through the API; API-seeded data updated and deleted through the UI |
| Browsers | Chromium, Firefox, WebKit |
| CI | Type checking, all tests, HTML/JUnit reports and failure evidence uploaded as an artifact |

There are **11 API cases and 6 UI cases per browser: 29 executions** in a complete run. See [validation notes](docs/VALIDATION.md) for the actual locally verified result.

## Useful commands

```sh
npm run test:api       # API tests only
npm run test:ui        # UI tests in all three browsers
npm run test:smoke     # critical create/read checks
npm run test:headed    # watch Chromium execute the UI tests
npm run test:debug     # step through a UI test
npm run typecheck     # strict TypeScript checking
npm run report        # open the most recent HTML report
```

Failed tests retain traces, screenshots, and video. The HTML report links to failure evidence. To open a trace directly: `npx playwright show-trace path/to/trace.zip`. Generated reports are ignored by Git; CI uploads them for 14 days.

## Structure and design choices

```text
app/                     Local demo server and interface
playwright.config.ts     Browser projects, reporting, server lifecycle
tests/fixtures/test.ts   Per-test workspace, API client, page setup, cleanup
tests/pages/issue-page.ts Reusable UI interactions
tests/api/               API contract and negative scenarios
tests/ui/                User workflows and failure recovery
.github/workflows/       GitHub Actions pipeline
docs/                    Test plan, validation, publishing and walkthrough
```

- **Isolation:** a fresh random workspace for every test, shared between that test’s browser and API client. Fixture teardown deletes its workspace. No global reset that could interfere with parallel workers.
- **Locators:** accessible roles and labels rather than brittle CSS selectors. The page object contains repeated user actions; assertions stay in the tests.
- **Synchronization:** Playwright’s awaited actions and retrying assertions, with no fixed sleeps.
- **Risk-based checks:** persistence and server-side state are checked, alongside invalid inputs and recoverable failure behavior.
- **CI retries:** one retry on CI, zero locally. A retry is diagnostic support, not a reason to ignore flaky results.

## Scope and limitations

Workspace IDs separate test data; they are **not authentication or authorization**. The demo server has no users, database, production hardening, or durability. The workspace deletion endpoint exists for test cleanup. Run it locally rather than deploying it as a public service.

WebKit is the Playwright engine project, not a run against the installed Safari application. The suite does not claim full accessibility, performance, mobile-device, visual-regression, or security coverage. The HTML-like title case is one focused rendering check, not a security audit.

## Publish and explain the project

Follow [publishing instructions](docs/PUBLISH.md) to upload the repository. Use the [walkthrough](docs/WALKTHROUGH.md) to understand the code and practice explaining its tradeoffs before sharing it with an interviewer.

Once you have run, reviewed, and understood the project, a CV line could be:

> Personal project: Built and maintained a Playwright and TypeScript test suite covering UI and REST API workflows, cross-browser execution, isolated test data, and GitHub Actions reporting.

Only use that wording after you can explain and modify the tests yourself. Repository: https://github.com/RubyKalfa/playwright-qa-portfolio.

## References

- [Playwright installation](https://playwright.dev/docs/intro)
- [API testing](https://playwright.dev/docs/api-testing)
- [GitHub Actions setup](https://playwright.dev/docs/ci-intro)
- [Best practices](https://playwright.dev/docs/best-practices)
