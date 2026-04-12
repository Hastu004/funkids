import { getWebpayResult } from '../_shared';

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId')?.trim();

  if (!orderId) {
    return Response.json({ message: 'Debes indicar un orderId.' }, { status: 400 });
  }

  return getWebpayResult(orderId, env);
};
