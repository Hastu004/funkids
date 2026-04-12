import { adminLogin, type AdminLoginPayload } from '../_shared';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const payload = (await request.json()) as AdminLoginPayload;
  return adminLogin(payload, env);
};
