const GITHUB_API = 'https://api.github.com';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function sanitizeProjectPath(pathHint, projectId) {
  const fallback = `projects/${projectId || `proj-${Date.now()}`}.json`;
  const candidate = String(pathHint || fallback).replace(/\\/g, '/');
  const clean = candidate
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, '-'))
    .join('/');
  if (!clean || clean.includes('..')) {
    throw new Error('Invalid project path');
  }
  return clean.endsWith('.json') ? clean : `${clean}.json`;
}

async function githubRequest(url, token, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'dub5-publish-proxy',
      ...(options.headers || {}),
    },
  });
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    json(res, 500, { error: 'Missing GitHub environment variables' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { projectId, pathHint, encryptedPayload, message } = body;
    if (!encryptedPayload?.iv || !encryptedPayload?.data) {
      json(res, 400, { error: 'Missing encrypted payload' });
      return;
    }

    const path = sanitizeProjectPath(pathHint, projectId);
    const contentsUrl = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`;

    let sha = null;
    const existingResponse = await githubRequest(`${contentsUrl}?ref=${encodeURIComponent(branch)}`, token, { method: 'GET' });
    if (existingResponse.ok) {
      const existing = await existingResponse.json();
      sha = existing.sha || null;
    } else if (existingResponse.status !== 404) {
      const failureText = await existingResponse.text();
      throw new Error(`GitHub lookup failed: ${existingResponse.status} ${failureText}`);
    }

    const writeBody = {
      message: message || `DUB5 publish ${projectId || ''}`.trim(),
      content: Buffer.from(JSON.stringify(encryptedPayload), 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    };

    const writeResponse = await githubRequest(contentsUrl, token, {
      method: 'PUT',
      body: JSON.stringify(writeBody),
    });

    if (!writeResponse.ok) {
      const failureText = await writeResponse.text();
      throw new Error(`GitHub write failed: ${writeResponse.status} ${failureText}`);
    }

    const payload = await writeResponse.json();
    json(res, 200, {
      path,
      branch,
      commitUrl: payload.commit?.html_url || null,
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
    });
  } catch (error) {
    console.error(error);
    json(res, 500, { error: error.message || 'Publish failed' });
  }
};
