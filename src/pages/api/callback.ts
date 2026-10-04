import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { env, siteOrigin } from '@/lib/server';

// Step 2 of the GitHub login for the content editor: exchange the code for a token
// and hand it to the Decap CMS window that opened the popup.
export const prerender = false;

function page(origin: string, status: 'success' | 'error', content: Record<string, string>) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  // Only ever deliver the token to our own /admin page.
  const script = `
    (function () {
      var origin = ${JSON.stringify(origin)};
      var message = ${JSON.stringify(message)};
      function receive(e) {
        if (e.origin !== origin) return;
        window.opener.postMessage(message, origin);
        window.removeEventListener('message', receive);
        setTimeout(function () { window.close(); }, 500);
      }
      if (!window.opener) { document.body.textContent = 'Please start the login from /admin.'; return; }
      window.addEventListener('message', receive, false);
      window.opener.postMessage('authorizing:github', origin);
    })();`.replace(/</g, '\\u003c');
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title></head><body><p>Signing in…</p><script>${script}</script></body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export const GET: APIRoute = async ({ request, url, cookies }) => {
  const origin = siteOrigin(request);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  const expected = cookies.get('cms_oauth_state')?.value ?? '';
  cookies.delete('cms_oauth_state', { path: '/api' });

  if (!code || !expected || !safeEqual(state, expected)) {
    return page(origin, 'error', { message: 'Invalid login state. Please try again.' });
  }

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env('GITHUB_CLIENT_ID'),
        client_secret: env('GITHUB_CLIENT_SECRET'),
        code,
        redirect_uri: `${origin}/api/callback`,
      }),
    });
    const data = (await res.json()) as { access_token?: string; error_description?: string };
    if (!data.access_token) throw new Error(data.error_description || 'No access token returned');
    return page(origin, 'success', { token: data.access_token, provider: 'github' });
  } catch (err) {
    console.error('[cms-auth] token exchange failed', err);
    return page(origin, 'error', { message: 'GitHub login failed.' });
  }
};
