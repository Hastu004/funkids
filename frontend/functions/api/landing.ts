import { getLandingData } from './_shared';

export const onRequestGet: PagesFunction = () => {
  return Response.json(getLandingData());
};
