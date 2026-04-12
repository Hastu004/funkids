import { adminLogin, type AdminLoginPayload } from '../_shared';

export const onRequestPost: PagesFunction = async ({ request }) => {
  const payload = (await request.json()) as AdminLoginPayload;
  return adminLogin(payload);
};
