export async function onRequestGet(context) {
  const { KV } = context.env;
  const data = await KV.get('messages', { type: 'json' });
  return Response.json(data || []);
}

export async function onRequestPost(context) {
  const { KV } = context.env;
  const body = await context.request.json();
  const data = await KV.get('messages', { type: 'json' }) || [];
  data.push({
    name: body.name || '匿名',
    content: body.content,
    time: new Date().toISOString()
  });
  await KV.put('messages', JSON.stringify(data));
  return Response.json({ success: true });
}
