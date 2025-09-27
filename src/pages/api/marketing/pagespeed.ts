import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // Simulate fetching data and potential delays
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockData = {
    "performance": 95,
    "accessibility": 98,
    "best-practices": 92,
    "seo": 100,
    "pwa": 80
  };

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
