export const prerender = false;
import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody); // Keep this for debugging if needed

    if (!rawBody) {
      return new Response(JSON.stringify({ error: 'Request body is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body', details: (jsonError as Error).message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { prompt, history } = parsedBody;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize GoogleGenerativeAI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Format history for Gemini API
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts.map((part: any) => ({ text: part.text })),
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500, // Adjust as needed
      },
    });

    // Send the prompt and get the response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Return the response from the model
    return new Response(JSON.stringify({ text: aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing Gemini API call:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};