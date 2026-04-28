// FSAE Docs — GitHub API proxy
// Stores the GitHub token server-side so it is never exposed to the browser.
//
// Deploy this to Cloudflare Workers, then add your token:
//   Dashboard → Workers → your worker → Settings → Variables → Add secret → GITHUB_TOKEN
//
// The worker only forwards requests to the iitmotorsports/Documentation-Site repo.

const ALLOWED_PREFIX = '/repos/iitmotorsports/Documentation-Site';
const GITHUB_API     = 'https://api.github.com';

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return respond(null, 204);
    }

    const url = new URL(request.url);

    // Block requests targeting any other repo
    if (!url.pathname.startsWith(ALLOWED_PREFIX)) {
      return respond(JSON.stringify({ error: 'Forbidden' }), 403);
    }

    // Forward to GitHub with the token added server-side
    const githubUrl = GITHUB_API + url.pathname + url.search;

    const githubResponse = await fetch(githubUrl, {
      method:  request.method,
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept':        'application/vnd.github+json',
        'Content-Type':  'application/json',
        'User-Agent':    'FSAE-Docs-Worker',
      },
      body: request.method !== 'GET' ? request.body : null,
    });

    const body        = await githubResponse.text();
    const contentType = githubResponse.headers.get('Content-Type') || 'application/json';

    return respond(body, githubResponse.status, { 'Content-Type': contentType });
  },
};

function respond(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });
}
