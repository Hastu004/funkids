import { createAdminCashSale, type AdminCashSalePayload } from '../_shared';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const payload = (await request.json()) as AdminCashSalePayload;
  return createAdminCashSale(request, payload, env);
};
