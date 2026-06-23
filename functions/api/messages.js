export async function onRequestGet(context) {
  const { KV } = context.env;
  const data = await KV.get('messages', { type: 'json' });
  return Response.json(data || []);
}

export async function onRequestPost(context) {
  const { KV, ADMIN_PASSWORD } = context.env;
  const body = await context.request.json();
  const password = context.request.headers.get('x-admin-password');
  const storedPassword = await KV.get('admin_password');
  const validPassword = ADMIN_PASSWORD || storedPassword;
  if (body.action === 'set_password' && password === validPassword) {
    await KV.put('admin_password', body.new_password);
    return Response.json({ success: true });
  }
  if (body.action === 'init_password' && !validPassword) {
    await KV.put('admin_password', body.new_password);
    return Response.json({ success: true });
  }
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
  const password = context.request.headers.get('x-admin-password');
  const body = await context.request.json();
  const storedPassword = await KV.get('admin_password');
  const validPassword = ADMIN_PASSWORD || storedPassword;
  if (!validPassword || password !== validPassword) {
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
