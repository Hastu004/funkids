import { getAdminOrders } from '../_shared';

export const onRequestGet: PagesFunction = ({ request, env }) => {
  return getAdminOrders(request, env);
};
