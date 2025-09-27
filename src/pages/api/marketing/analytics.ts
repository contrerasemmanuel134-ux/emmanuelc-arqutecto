import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockData = {
    users: 7890,
    sessions: 10123,
    bounceRate: "45.67%",
    avgSessionDuration: "2m 34s"
  };

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
