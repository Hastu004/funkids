import { searchAdminBenefits } from '../../_shared';

export const onRequestGet: PagesFunction = ({ request, env }) => {
  const params = new URL(request.url).searchParams;
  const query = params.get('q') ?? '';
  const status = params.get('status') ?? 'available';
  return searchAdminBenefits(request, query, status, env);
};
