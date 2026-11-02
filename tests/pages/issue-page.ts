import { type Page } from '@playwright/test';

export class IssuePage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/'); }
  async create(title: string, priority = 'Medium') {
    await this.page.getByLabel('Issue title', { exact: true }).fill(title);
    await this.page.getByLabel('Priority', { exact: true }).selectOption(priority);
    await this.page.getByRole('button', { name: 'Create issue', exact: true }).click();
  }
  issue(title: string) { return this.page.getByRole('article', { name: title, exact: true }); }
  async filter(status: string) { await this.page.getByLabel('Filter by status').selectOption(status); }
}
