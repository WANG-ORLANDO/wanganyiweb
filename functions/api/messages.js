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

export async function onRequestDelete(context) {
  const { KV, ADMIN_PASSWORD } = context.env;
  const body = await context.request.json();
  if (body.password !== ADMIN_PASSWORD) {
    return Response.json({ error: '密码错误' }, { status: 403 });
  }
  const data = await KV.get('messages', { type: 'json' }) || [];
  if (body.index < 0 || body.index >= data.length) {
    return Response.json({ error: '留言不存在' }, { status: 400 });
  }
  data.splice(body.index, 1);
  await KV.put('messages', JSON.stringify(data));
  return Response.json({ success: true });
}
