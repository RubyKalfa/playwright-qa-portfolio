import { randomUUID } from 'node:crypto';
import { test, expect } from '../fixtures/test.js';

const issueData = { title: 'Video does not start', priority: 'High' };

test('create and retrieve an issue @smoke', async ({ api }) => {
  const response = await api.post('/api/issues', { data: issueData });
  expect(response.status()).toBe(201);
  const issue = await response.json();
  expect(issue).toEqual({ id: expect.any(String), ...issueData, status: 'Open' });
  expect(issue.id).toMatch(/^[0-9a-f-]{36}$/);
  const fetched = await api.get(`/api/issues/${issue.id}`);
  expect(fetched.status()).toBe(200);
  expect(await fetched.json()).toEqual(issue);
});

test('status changes persist', async ({ api }) => {
  const issue = await (await api.post('/api/issues', { data: issueData })).json();
  const update = await api.patch(`/api/issues/${issue.id}`, { data: { status: 'Resolved' } });
  expect(update.status()).toBe(200);
  expect(await update.json()).toEqual({ ...issue, status: 'Resolved' });
  const fetched = await api.get(`/api/issues/${issue.id}`);
  expect((await fetched.json()).status).toBe('Resolved');
});

test('deleting an issue removes it from the list', async ({ api }) => {
  const issue = await (await api.post('/api/issues', { data: issueData })).json();
  expect((await api.delete(`/api/issues/${issue.id}`)).status()).toBe(204);
  expect((await api.get(`/api/issues/${issue.id}`)).status()).toBe(404);
  expect(await (await api.get('/api/issues')).json()).toEqual([]);
});

for (const title of ['', '   ', 'x'.repeat(121)]) {
  test(`reject invalid title (${title.length} characters)`, async ({ api }) => {
    const response = await api.post('/api/issues', { data: { ...issueData, title } });
    expect(response.status()).toBe(422);
    expect(await response.json()).toEqual({ error: 'Title must contain 1 to 120 characters' });
    expect(await (await api.get('/api/issues')).json()).toEqual([]);
  });
}

test('accepts the title length boundary and trims whitespace', async ({ api }) => {
  const title = 'x'.repeat(120);
  const response = await api.post('/api/issues', { data: { ...issueData, title: ` ${title} ` } });
  expect(response.status()).toBe(201);
  expect((await response.json()).title).toBe(title);
});

test('invalid status cannot overwrite an existing issue', async ({ api }) => {
  const issue = await (await api.post('/api/issues', { data: issueData })).json();
  const response = await api.patch(`/api/issues/${issue.id}`, { data: { status: 'Unknown' } });
  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({ error: 'Invalid status' });
  expect(await (await api.get(`/api/issues/${issue.id}`)).json()).toEqual(issue);
});

test('reject invalid priority and malformed JSON', async ({ api }) => {
  expect((await api.post('/api/issues', { data: { ...issueData, priority: 'Urgent' } })).status()).toBe(422);
  const malformed = await api.post('/api/issues', { data: Buffer.from('{bad'), headers: { 'Content-Type': 'application/json' } });
  expect(malformed.status()).toBe(400);
  expect(await malformed.json()).toEqual({ error: 'Invalid JSON body' });
});

test('workspaces cannot see or modify each other’s issues', async ({ api, playwright, baseURL }) => {
  const issue = await (await api.post('/api/issues', { data: issueData })).json();
  const other = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'X-Workspace': randomUUID() } });
  try {
    expect(await (await other.get('/api/issues')).json()).toEqual([]);
    expect((await other.get(`/api/issues/${issue.id}`)).status()).toBe(404);
    expect((await other.patch(`/api/issues/${issue.id}`, { data: { status: 'Resolved' } })).status()).toBe(404);
    expect((await other.delete(`/api/issues/${issue.id}`)).status()).toBe(404);
  } finally { await other.delete('/api/workspace'); await other.dispose(); }
});

test('API requires a workspace header', async ({ request }) => {
  const response = await request.get('/api/issues');
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'A valid X-Workspace header is required' });
});
