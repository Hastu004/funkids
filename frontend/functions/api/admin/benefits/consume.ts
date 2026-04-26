import { consumeAdminBenefit, type AdminConsumeBenefitPayload } from '../../_shared';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const payload = (await request.json()) as AdminConsumeBenefitPayload;
  return consumeAdminBenefit(request, payload, env);
};
