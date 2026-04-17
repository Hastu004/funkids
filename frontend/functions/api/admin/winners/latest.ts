import { deleteLatestAdminWinner } from '../../_shared';

export const onRequestDelete: PagesFunction = ({ request, env }) => {
  return deleteLatestAdminWinner(request, env);
};
