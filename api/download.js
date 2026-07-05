// Vercel Edge Function — redirects to the latest APK on GitHub Releases.
// Streaming 30MB+ through an edge function hits timeout limits; a redirect
// is instant, reliable, and lets the CDN serve the file at full speed.
export const config = { runtime: 'edge' };

const REPO  = 'adonisdamson/vanguard';
const ASSET = 'vanguard-latest.apk';

// Permanent fallback — always resolves to latest release asset on GitHub CDN
const FALLBACK = `https://github.com/${REPO}/releases/latest/download/${ASSET}`;

export default async function handler(req) {
  try {
    const apiRes = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'vanguard-web',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      }
    );

    if (!apiRes.ok) return Response.redirect(FALLBACK, 302);

    const release = await apiRes.json();
    const asset   = release.assets?.find(a => a.name === ASSET);

    // Redirect to CDN — browser downloads directly at full speed, no edge buffering
    const downloadUrl = asset?.browser_download_url ?? FALLBACK;
    return Response.redirect(downloadUrl, 302);

  } catch {
    return Response.redirect(FALLBACK, 302);
  }
}
