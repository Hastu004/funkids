import { resendAdminOrderReceipt } from '../../_shared';

interface ResendEmailPayload {
  orderId?: string;
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const payload = (await request.json()) as ResendEmailPayload;
  return resendAdminOrderReceipt(request, String(payload.orderId ?? ''), env);
};
