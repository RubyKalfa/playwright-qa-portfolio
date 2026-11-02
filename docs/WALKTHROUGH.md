# Interview walkthrough

## Start with the user risk

“A user needs an issue to survive a page reload, so the create test checks the visible record, reloads the browser, and independently checks the server through the API.” Open `tests/ui/issues.spec.ts` and follow that first test.

## Explain the fixture

Each test gets a UUID workspace. The API client sends it in a header; the browser stores the same value in local storage and sends it with requests. This keeps tests independent under parallel execution. Teardown deletes only that test’s data. These workspace IDs are test namespaces, not user authentication.

## Explain the page object

`IssuePage` holds repeated actions and the issue locator. Tests retain their assertions so the expected behavior is easy to read. Locators use labels and roles, so a layout change does not automatically break them.

## Explain an API negative case

The invalid-status test first creates a real record, sends a bad update, expects 422, and fetches the record again. The last assertion matters: an error response alone would not prove the original state survived.

## Explain the failure test

A route interception makes only the browser’s create request return 503. The test checks the error and that the create button is enabled, verifies no record reached the server, removes the interception, and retries successfully. This is controlled failure injection, not a real outage.

## Explain CI and investigation

The workflow installs exact locked dependencies and browser binaries, runs the type checker, and executes the suite. Reports and failure traces are attached to the workflow run. Start with the first failing assertion, inspect its trace, then reproduce locally. A passing retry still deserves investigation.

## Practice improvements

1. Add an API case for fetching an unknown ID and assert both status and body.
2. Add a UI check for an empty filtered result.
3. Extend the failure test to status updates and verify rollback.
4. Explain what changes would be needed for a real authenticated system.

Do one improvement yourself and describe why it matters. Being able to modify the suite is stronger evidence than repeating terminology from the README.
