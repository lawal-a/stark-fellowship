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

  const { firstName, lastName, email, phone, state, conference, businessStatus, expectation } = body;

  if (!firstName?.trim())    return json({ success: false, message: 'First name is required.' }, 400);
  if (!lastName?.trim())     return json({ success: false, message: 'Last name is required.' }, 400);
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ success: false, message: 'A valid email address is required.' }, 400);
  if (!phone?.trim())        return json({ success: false, message: 'Phone number is required.' }, 400);
  if (!state?.trim())        return json({ success: false, message: 'State of residence is required.' }, 400);
  if (!conference || conference !== 'Jos')
    return json({ success: false, message: 'Conference registrations are only open for Jos.' }, 400);
  if (!businessStatus?.trim()) return json({ success: false, message: 'Business status is required.' }, 400);
  if (!expectation?.trim())  return json({ success: false, message: 'Please share what you hope to take away.' }, 400);

  const id = crypto.randomUUID();
  const record = {
    id,
    type:           'conference',
    conference,
    firstName:      firstName.trim(),
    lastName:       lastName.trim(),
    name:           `${firstName.trim()} ${lastName.trim()}`,
    email:          email.trim().toLowerCase(),
    phone:          phone.trim(),
    state:          state.trim(),
    occupation:     body.occupation?.trim()    || '',
    businessStatus: businessStatus.trim(),
    businessName:   body.businessName?.trim()  || '',
    industry:       body.industry?.trim()       || '',
    expectation:    expectation.trim(),
    hearAbout:      body.hearAbout             || '',
    submittedAt:    new Date().toISOString(),
  };

  if (env.STARK_DATA) {
    await env.STARK_DATA.put(
      `conference:${conference.toLowerCase()}:${id}`,
      JSON.stringify(record),
      { metadata: { name: record.name, email: record.email, conference, state,
                    businessStatus, submittedAt: record.submittedAt } },
    );
  } else {
    console.log('[STARK conference] KV not bound:', JSON.stringify(record));
  }

  try {
    await fetch(
      'https://script.google.com/macros/s/AKfycbwjgQSLzJlU1NISuZjq7-6Lx__E9n3SJpiLi3qARxHoXFF-kB9EnYu0zUNY0ns8sltW/exec',
      { method: 'POST', body: JSON.stringify(record), headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.log('[STARK conference] Sheets sync failed:', err.message);
  }

  return json({ success: true, message: 'Registration received!', id });
}
