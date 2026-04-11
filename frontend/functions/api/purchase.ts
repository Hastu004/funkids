import { createPurchase, type PurchasePayload } from './_shared';

export const onRequestPost: PagesFunction = async ({ request }) => {
  const payload = (await request.json()) as PurchasePayload;
  return createPurchase(payload);
};
