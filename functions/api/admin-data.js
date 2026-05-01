/**
 * Cloudflare Pages Function — GET /api/admin-data
 *
 * Returns all waitlist + volunteer submissions from KV.
 * Protected by STARK_ADMIN_KEY environment variable.
 *
 * Usage: /api/admin-data?key=YOUR_ADMIN_KEY
 *
 * Set STARK_ADMIN_KEY in Cloudflare Pages → Settings → Environment variables.
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!env.STARK_ADMIN_KEY) {
    return json({ error: 'Admin key not configured. Set STARK_ADMIN_KEY in environment variables.' }, 503);
  }
  if (key !== env.STARK_ADMIN_KEY) {
    return json({ error: 'Unauthorized. Invalid admin key.' }, 401);
  }

  if (!env.STARK_DATA) {
    return json({ error: 'KV namespace not bound. Configure STARK_DATA binding.' }, 503);
  }

  try {
    const [waitlistList, volunteerList] = await Promise.all([
      env.STARK_DATA.list({ prefix: 'waitlist:' }),
      env.STARK_DATA.list({ prefix: 'volunteer:' }),
    ]);

    const [waitlist, volunteers] = await Promise.all([
      Promise.all(waitlistList.keys.map(k => env.STARK_DATA.get(k.name, 'json'))),
      Promise.all(volunteerList.keys.map(k => env.STARK_DATA.get(k.name, 'json'))),
    ]);

    const sortByDate = (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt);

    return json({
      success: true,
      waitlist:   waitlist.filter(Boolean).sort(sortByDate),
      volunteers: volunteers.filter(Boolean).sort(sortByDate),
      totals: {
        waitlist:   waitlist.filter(Boolean).length,
        volunteers: volunteers.filter(Boolean).length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[STARK admin] Error fetching data:', err);
    return json({ error: 'Failed to fetch data. Check KV configuration.' }, 500);
  }
}
