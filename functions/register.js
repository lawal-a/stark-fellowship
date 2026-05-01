/**
 * Cloudflare Pages Function — POST /register
 * Stores waitlist submissions to KV under prefix "waitlist:"
 *
 * Required KV binding: STARK_DATA (set in Cloudflare Pages → Settings → Functions)
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ success: false, message: 'Invalid request body.' }, 400); }

  const { firstName, lastName, email, programs } = body;

  if (!firstName?.trim()) return json({ success: false, message: 'First name is required.' }, 400);
  if (!lastName?.trim())  return json({ success: false, message: 'Last name is required.' }, 400);
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ success: false, message: 'A valid email address is required.' }, 400);
  if (!Array.isArray(programs) || programs.length === 0)
    return json({ success: false, message: 'Please select at least one program.' }, 400);

  const id = crypto.randomUUID();
  const record = {
    id,
    type:        'waitlist',
    firstName:   firstName.trim(),
    lastName:    lastName.trim(),
    name:        `${firstName.trim()} ${lastName.trim()}`,
    email:       email.trim().toLowerCase(),
    phone:       body.phone?.trim() || '',
    city:        body.city?.trim() || '',
    programs,
    stage:       body.stage || '',
    hearAbout:   body.hearAbout || '',
    message:     body.message?.trim() || '',
    submittedAt: new Date().toISOString(),
  };

  if (env.STARK_DATA) {
    await env.STARK_DATA.put(`waitlist:${id}`, JSON.stringify(record), {
      metadata: { name: record.name, email: record.email, programs: programs.join(', '), submittedAt: record.submittedAt },
    });
  } else {
    console.log('[STARK waitlist] KV not bound:', JSON.stringify(record));
  }

  return json({ success: true, message: 'Waitlist registration received!', id });
}
