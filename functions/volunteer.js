/**
 * Cloudflare Pages Function — POST /volunteer
 * Stores volunteer submissions to KV under prefix "volunteer:"
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

  const { firstName, lastName, email, state, role } = body;

  if (!firstName?.trim()) return json({ success: false, message: 'First name is required.' }, 400);
  if (!lastName?.trim())  return json({ success: false, message: 'Last name is required.' }, 400);
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ success: false, message: 'A valid email address is required.' }, 400);
  if (!state?.trim()) return json({ success: false, message: 'Please select your state or region.' }, 400);
  if (state === 'diaspora' && !body.diasporaCountry?.trim())
    return json({ success: false, message: 'Please enter your country.' }, 400);
  if (!role?.trim()) return json({ success: false, message: 'Please describe your role.' }, 400);

  const id = crypto.randomUUID();
  const record = {
    id,
    type:            'volunteer',
    firstName:       firstName.trim(),
    lastName:        lastName.trim(),
    name:            `${firstName.trim()} ${lastName.trim()}`,
    email:           email.trim().toLowerCase(),
    phone:           body.phone?.trim() || '',
    state,
    diasporaCountry: body.diasporaCountry?.trim() || '',
    locationLabel:   state === 'diaspora' ? `Diaspora – ${body.diasporaCountry?.trim()}` : state,
    role:            role.trim(),
    network:         body.network?.trim() || '',
    message:         body.message?.trim() || '',
    submittedAt:     new Date().toISOString(),
  };

  if (env.STARK_DATA) {
    await env.STARK_DATA.put(`volunteer:${id}`, JSON.stringify(record), {
      metadata: { name: record.name, email: record.email, state: record.locationLabel, submittedAt: record.submittedAt },
    });
  } else {
    console.log('[STARK volunteer] KV not bound:', JSON.stringify(record));
  }

  return json({ success: true, message: 'Volunteer submission received!', id });
}
