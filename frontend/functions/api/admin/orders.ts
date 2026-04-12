import { getAdminOrders } from '../_shared';

export const onRequestGet: PagesFunction = ({ request }) => {
  return getAdminOrders(request);
};
