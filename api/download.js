// Vercel Edge Function — proxies download through Railway so the user never
// sees a GitHub URL. Railway streams the APK bytes directly with the correct
// Content-Disposition header.
export const config = { runtime: 'edge' };

const RAILWAY_DOWNLOAD = 'https://vanguard-api-production-f2a9.up.railway.app/download';

export default async function handler() {
  return Response.redirect(RAILWAY_DOWNLOAD, 302);
}
