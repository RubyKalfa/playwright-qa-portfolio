import { test, expect } from '../fixtures/test.js';

test('create an issue and retain it after reload @smoke', async ({ issuePage, api, page }) => {
  await issuePage.open();
  await issuePage.create('Playback freezes', 'High');
  await expect(page.getByRole('status')).toHaveText('Issue created.');
  await expect(issuePage.issue('Playback freezes')).toContainText('Priority: High');
  await page.reload();
  await expect(issuePage.issue('Playback freezes')).toBeVisible();
  // Verify the browser action reached the server, not just local UI state.
  const response = await api.get('/api/issues');
  expect(await response.json()).toEqual([expect.objectContaining({ title: 'Playback freezes', priority: 'High', status: 'Open' })]);
});

test('blank titles show an error without creating an issue', async ({ issuePage, page, api }) => {
  await issuePage.open();
  await issuePage.create('   ');
  await expect(page.getByRole('alert')).toHaveText('Enter an issue title.');
  await expect(page.getByLabel('Issue title', { exact: true })).toBeFocused();
  expect(await (await api.get('/api/issues')).json()).toEqual([]);
});

test('update status and filter issues', async ({ issuePage, api, page }) => {
  await api.post('/api/issues', { data: { title: 'Broken subtitles', priority: 'Medium' } });
  await api.post('/api/issues', { data: { title: 'Missing thumbnail', priority: 'Low' } });
  await issuePage.open();
  await issuePage.issue('Broken subtitles').getByLabel('Status', { exact: true }).selectOption('Resolved');
  await expect(page.getByRole('status')).toHaveText('Status updated.');
  await issuePage.filter('Resolved');
  await expect(issuePage.issue('Broken subtitles')).toBeVisible();
  await expect(issuePage.issue('Missing thumbnail')).toHaveCount(0);
  await page.reload();
  await expect(issuePage.issue('Broken subtitles').getByLabel('Status', { exact: true })).toHaveValue('Resolved');
});

test('delete an issue and verify it stays deleted', async ({ issuePage, api, page }) => {
  const issue = await (await api.post('/api/issues', { data: { title: 'Outdated banner', priority: 'Low' } })).json();
  await issuePage.open();
  await issuePage.issue('Outdated banner').getByRole('button', { name: 'Delete issue' }).click();
  await expect(page.getByRole('status')).toHaveText('Issue deleted.');
  await expect(issuePage.issue('Outdated banner')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('No issues found.', { exact: true })).toBeVisible();
  expect((await api.get(`/api/issues/${issue.id}`)).status()).toBe(404);
});

test('server failure shows an error and allows retry', async ({ issuePage, page, api }) => {
  await issuePage.open();
  await expect(page.getByText('No issues found.', { exact: true })).toBeVisible();
  await page.route('**/api/issues', async route => {
    if (route.request().method() === 'POST') await route.fulfill({ status: 503, json: { error: 'Unavailable' } });
    else await route.continue();
  });
  await issuePage.create('Retry upload');
  await expect(page.getByRole('alert')).toHaveText('Could not create issue. Please try again.');
  await expect(page.getByRole('button', { name: 'Create issue' })).toBeEnabled();
  expect(await (await api.get('/api/issues')).json()).toEqual([]);
  await page.unroute('**/api/issues');
  await issuePage.create('Retry upload');
  await expect(issuePage.issue('Retry upload')).toBeVisible();
  await expect(page.getByRole('alert')).toBeHidden();
});

test('issue titles render as text rather than HTML', async ({ issuePage, page }) => {
  await issuePage.open();
  const title = '<img src=x onerror="window.injected=true">';
  await issuePage.create(title);
  await expect(issuePage.issue(title).getByRole('heading')).toHaveText(title);
  await expect(issuePage.issue(title).locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => 'injected' in window)).toBe(false);
});
