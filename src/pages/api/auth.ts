import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { env, siteOrigin } from '@/lib/server';

// Step 1 of the GitHub login for the content editor (/admin).
// Decap CMS opens this URL in a popup; we send the user to GitHub to sign in.
export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const clientId = env('GITHUB_CLIENT_ID');
  if (!clientId) return new Response('GITHUB_CLIENT_ID is not configured on the server.', { status: 500 });

  const origin = siteOrigin(request);
  const state = randomBytes(24).toString('hex');
  cookies.set('cms_oauth_state', state, {
    path: '/api',
    httpOnly: true,
    sameSite: 'lax',
    secure: origin.startsWith('https://'),
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/callback`,
    scope: new URL(request.url).searchParams.get('scope') || 'repo,user',
    state,
  });
  return redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
};
