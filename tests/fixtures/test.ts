import { randomUUID } from 'node:crypto';
import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { IssuePage } from '../pages/issue-page.js';

type Fixtures = { workspace: string; api: APIRequestContext; issuePage: IssuePage };
export const test = base.extend<Fixtures>({
  workspace: async ({}, use) => { await use(randomUUID()); },
  api: async ({ playwright, baseURL, workspace }, use) => {
    const api = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'X-Workspace': workspace } });
    try { await use(api); }
    finally {
      await api.delete('/api/workspace');
      await api.dispose();
    }
  },
  issuePage: async ({ page, workspace, api }, use) => {
    // Share the same workspace between browser and API, without logging in.
    await page.addInitScript(value => localStorage.setItem('workspace', value), workspace);
    await use(new IssuePage(page));
    // The api dependency keeps cleanup alive until browser use is complete.
    void api;
  },
});
export { expect };
