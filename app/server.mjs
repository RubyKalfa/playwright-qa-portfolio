import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

// Deliberately small demo system: local, in-memory, no authentication or database.
const stores = new Map();
const statuses = ['Open', 'In progress', 'Resolved'];
const priorities = ['Low', 'Medium', 'High'];
const html = await readFile(new URL('./index.html', import.meta.url));
function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}
async function json(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 16_384) throw new Error('Body too large');
  }
  return JSON.parse(body);
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { status: 'ok' });
  if (!url.pathname.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
  const workspace = req.headers['x-workspace'];
  if (typeof workspace !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(workspace)) {
    return send(res, 400, { error: 'A valid X-Workspace header is required' });
  }
  if (!stores.has(workspace)) stores.set(workspace, new Map());
  const issues = stores.get(workspace);
  // Only used by fixtures to release their own test data.
  if (url.pathname === '/api/workspace' && req.method === 'DELETE') {
    stores.delete(workspace);
    res.writeHead(204); return res.end();
  }
  if (url.pathname === '/api/issues' && req.method === 'GET') return send(res, 200, [...issues.values()]);
  if (url.pathname === '/api/issues' && req.method === 'POST') {
    let body;
    try { body = await json(req); } catch { return send(res, 400, { error: 'Invalid JSON body' }); }
    if (typeof body?.title !== 'string' || !body.title.trim() || body.title.trim().length > 120) {
      return send(res, 422, { error: 'Title must contain 1 to 120 characters' });
    }
    if (!priorities.includes(body.priority)) return send(res, 422, { error: 'Invalid priority' });
    const issue = { id: randomUUID(), title: body.title.trim(), priority: body.priority, status: 'Open' };
    issues.set(issue.id, issue);
    return send(res, 201, issue);
  }
  const match = url.pathname.match(/^\/api\/issues\/([^/]+)$/);
  if (!match) return send(res, 404, { error: 'Not found' });
  const issue = issues.get(match[1]);
  if (!issue) return send(res, 404, { error: 'Issue not found' });
  if (req.method === 'GET') return send(res, 200, issue);
  if (req.method === 'PATCH') {
    let body;
    try { body = await json(req); } catch { return send(res, 400, { error: 'Invalid JSON body' }); }
    if (!statuses.includes(body?.status)) return send(res, 422, { error: 'Invalid status' });
    issue.status = body.status;
    return send(res, 200, issue);
  }
  if (req.method === 'DELETE') {
    issues.delete(issue.id); res.writeHead(204); return res.end();
  }
  return send(res, 405, { error: 'Method not allowed' });
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Issue tracker: http://127.0.0.1:4173'));
