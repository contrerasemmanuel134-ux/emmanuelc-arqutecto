import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockData = {
    impressions: 150000,
    clicks: 3456,
    ctr: "2.30%",
    cpc: "1.23"
  };

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
