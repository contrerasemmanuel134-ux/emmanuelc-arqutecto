import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockData = {
    totals: {
      clicks: 12345,
      impressions: 567890,
      ctr: 0.0217, // Use decimal for calculations, format in frontend
      position: 15.8
    },
    queries: [
      { keys: ['diseñador web freelance'], clicks: 150, impressions: 2500, ctr: 0.06, position: 3.5 },
      { keys: ['desarrollador astro'], clicks: 120, impressions: 1800, ctr: 0.0667, position: 5.1 },
      { keys: ['optimización web'], clicks: 95, impressions: 3200, ctr: 0.0297, position: 8.2 },
      { keys: ['consultoría seo'], clicks: 80, impressions: 4500, ctr: 0.0178, position: 12.0 },
      { keys: ['marketing digital para arquitectos'], clicks: 65, impressions: 1200, ctr: 0.0542, position: 4.8 }
    ]
  };

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};