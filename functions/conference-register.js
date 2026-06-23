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

  const { firstName, lastName, email, phone, state, conference } = body;

  if (!firstName?.trim()) return json({ success: false, message: 'First name is required.' }, 400);
  if (!lastName?.trim())  return json({ success: false, message: 'Last name is required.' }, 400);
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ success: false, message: 'A valid email address is required.' }, 400);
  if (!phone?.trim()) return json({ success: false, message: 'Phone number is required.' }, 400);
  if (!state?.trim()) return json({ success: false, message: 'State of residence is required.' }, 400);
  if (!conference || !['Jos', 'Benue'].includes(conference))
    return json({ success: false, message: 'Please select a conference city.' }, 400);

  const id = crypto.randomUUID();
  const record = {
    id,
    type:        'conference',
    conference,
    firstName:   firstName.trim(),
    lastName:    lastName.trim(),
    name:        `${firstName.trim()} ${lastName.trim()}`,
    email:       email.trim().toLowerCase(),
    phone:       phone.trim(),
    state:       state.trim(),
    occupation:  body.occupation?.trim() || '',
    hearAbout:   body.hearAbout || '',
    submittedAt: new Date().toISOString(),
  };

  if (env.STARK_DATA) {
    await env.STARK_DATA.put(`conference:${conference.toLowerCase()}:${id}`, JSON.stringify(record), {
      metadata: { name: record.name, email: record.email, conference, state, submittedAt: record.submittedAt },
    });
  } else {
    console.log('[STARK conference] KV not bound:', JSON.stringify(record));
  }

  return json({ success: true, message: 'Registration received!', id });
}
