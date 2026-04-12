import { drawAdminWinner } from '../_shared';

export const onRequestPost: PagesFunction = ({ request, env }) => {
  return drawAdminWinner(request, env);
};
