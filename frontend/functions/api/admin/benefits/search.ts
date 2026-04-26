import { searchAdminBenefits } from '../../_shared';

export const onRequestGet: PagesFunction = ({ request, env }) => {
  const query = new URL(request.url).searchParams.get('q') ?? '';
  return searchAdminBenefits(request, query, env);
};
