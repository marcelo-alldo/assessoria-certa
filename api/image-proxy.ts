import type { IncomingMessage, ServerResponse } from 'http';

const ALLOWED_HOSTS = ['.s3.amazonaws.com', '.s3.us-east-1.amazonaws.com'];

function isAllowedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return ALLOWED_HOSTS.some((host) => parsed.hostname.endsWith(host));
  } catch {
    return false;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const urlParam = new URL(req.url || '', 'http://localhost').searchParams.get('url');

  if (!urlParam || !isAllowedUrl(urlParam)) {
    res.statusCode = 400;
    res.end('Invalid or disallowed URL');
    return;
  }

  try {
    const upstream = await fetch(urlParam);

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.end('Upstream error');
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer = await upstream.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(Buffer.from(buffer));
  } catch {
    res.statusCode = 502;
    res.end('Failed to fetch upstream resource');
  }
}
