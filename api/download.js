// Vercel serverless function — proxies the GitHub release APK download.
// Users hit /api/download (or /download via vercel.json rewrite),
// this fetches the real asset URL from GitHub API and redirects.
// GitHub URL never appears in the user's browser.

export default async function handler(req, res) {
  try {
    const apiRes = await fetch(
      'https://api.github.com/repos/adonisdamson/vanguard/releases/latest',
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'vanguard-web',
          // Optional: add a GitHub PAT as env var to raise rate limit from 60→5000 req/hr
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      }
    );

    if (!apiRes.ok) {
      return res.status(502).json({ error: 'Could not reach release API', status: apiRes.status });
    }

    const release = await apiRes.json();

    // Find the fixed-name APK asset
    const asset = release.assets?.find(a => a.name === 'vanguard-latest.apk');

    if (!asset) {
      // Fallback: redirect to the releases page so the user can pick it manually
      return res.redirect(302, 'https://github.com/adonisdamson/vanguard/releases/latest');
    }

    // Redirect to the real download URL — browser downloads the file immediately
    return res.redirect(302, asset.browser_download_url);
  } catch (err) {
    return res.status(500).json({ error: 'Download unavailable', detail: err.message });
  }
}
