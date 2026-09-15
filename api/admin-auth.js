export const ADMIN_COOKIE = 'midas_admin_session';

let testAuthVerifier = null;

export function __setAdminAuthVerifierForTests(verifier) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test auth verifier is only available in test mode');
  }
  testAuthVerifier = verifier;
}

export function getConfiguredAdminEmails(env = process.env) {
  return new Set(
    (env.ADMIN_EMAILS || env.ADMIN_EMAIL || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value)
      .map(([key, ...value]) => [key, decodeURIComponent(value.join('='))])
  );
}

export function getAccessToken(req) {
  const authorization = req.get('authorization') || '';
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }
  return parseCookies(req.get('cookie')).midas_admin_session || null;
}

export function createAdminGuard({ supabase, adminEmails }) {
  return async function requireAdmin(req, res, next) {
    const token = getAccessToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const verifier = testAuthVerifier || (supabase && ((accessToken) => supabase.auth.getUser(accessToken)));
      if (!verifier) {
        return res.status(503).json({ error: 'Admin authentication is not configured' });
      }

      const result = await verifier(token);
      const user = result?.data?.user || result?.user;
      const email = user?.email?.trim().toLowerCase();
      if (!email) {
        return res.status(401).json({ error: 'Invalid authentication session' });
      }
      if (!adminEmails.has(email)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      req.adminUser = { id: user.id, email };
      return next();
    } catch (error) {
      console.warn('Admin authentication failed:', error.message);
      return res.status(401).json({ error: 'Invalid authentication session' });
    }
  };
}

export function setAdminCookie(res, accessToken, maxAgeSeconds = 60 * 60 * 8) {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=${encodeURIComponent(accessToken)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );
}

export function clearAdminCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
  );
}
