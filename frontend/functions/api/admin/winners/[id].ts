import { deleteAdminWinnerById } from '../../_shared';

export const onRequestDelete: PagesFunction = ({ request, env, params }) => {
  return deleteAdminWinnerById(request, Number(params.id), env);
};
