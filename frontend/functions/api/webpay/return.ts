import { handleWebpayReturn } from '../_shared';

export const onRequest: PagesFunction = async ({ request, env }) => {
  return handleWebpayReturn(request, env);
};
