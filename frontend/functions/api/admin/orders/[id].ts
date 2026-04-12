import { deleteAdminOrder, type AdminOrderUpdatePayload, updateAdminOrder } from '../../_shared';

export const onRequestPut: PagesFunction = async ({ request, env, params }) => {
  const payload = (await request.json()) as AdminOrderUpdatePayload;
  return updateAdminOrder(request, String(params.id), payload, env);
};

export const onRequestDelete: PagesFunction = ({ request, env, params }) => {
  return deleteAdminOrder(request, String(params.id), env);
};
