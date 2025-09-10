import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });

const app = express();
app.use(cors({ origin: true }));

// In production, you should restrict the origin to your app's domain.
// Example: app.use(cors({ origin: 'https://your-app-name.firebaseapp.com' }));

// Middleware to verify Firebase ID token.
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).send('Unauthorized: No token provided');
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    // Verify the ID token. You can get the user's info from the decoded token if needed.
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // (req as any).user = decodedToken;
    await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
};

// Project CRUD
app.get("/projects", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("projects").get();
    const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(projects);
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/projects", authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400).send("Bad Request: Missing name or description");
      return;
    }
    const project = { name, description, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    const writeResult = await admin.firestore().collection("projects").add(project);
    res.status(201).send({ id: writeResult.id });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/projects/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400).send("Bad Request: Missing name or description");
      return;
    }
    await admin.firestore().collection("projects").doc(id).update({ name, description });
    res.status(200).send({ id });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/projects/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection("projects").doc(id).delete();
    res.status(200).send({ id });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Blog Post CRUD
app.get("/blogs", async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection("blogPosts").orderBy("fechaCreacion", "desc").get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(posts);
  } catch (error) {
    console.error("Error getting blog posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/blogs", authenticate, async (req, res) => {
  try {
    const postData = req.body;
    // Basic validation
    if (!postData.titulo || !postData.slug) {
      res.status(400).send("Bad Request: Missing title or slug");
      return;
    }
    const post = { ...postData, fechaCreacion: admin.firestore.FieldValue.serverTimestamp() };
    const writeResult = await admin.firestore().collection("blogPosts").add(post);
    res.status(201).send({ id: writeResult.id });
  } catch (error) {
    console.error("Error adding blog post:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/blogs/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    if (!postData.titulo || !postData.slug) {
      res.status(400).send("Bad Request: Missing title or slug");
      return;
    }
    await admin.firestore().collection("blogPosts").doc(id).update(postData);
    res.status(200).send({ id });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/blogs/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection("blogPosts").doc(id).delete();
    res.status(200).send({ id });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Media (Firebase Storage) CRUD
app.get("/media", authenticate, async (req, res) => {
  try {
    const bucket = admin.storage().bucket();
    // Puedes especificar un prefijo si guardas las imágenes en una carpeta, ej: "uploads/"
    const [files] = await bucket.getFiles();

    const mediaItems = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491' // Una fecha muy lejana en el futuro
        });
        return {
          name: file.name,
          url: url,
          contentType: metadata.contentType,
          size: metadata.size,
          updated: metadata.updated,
        };
      })
    );

    res.status(200).send(mediaItems);
  } catch (error) {
    console.error("Error getting media files:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/media/:fileName", authenticate, async (req, res) => {
  try {
    const bucket = admin.storage().bucket();
    const fileName = req.params.fileName;
    // Si usas carpetas, asegúrate de que el fileName incluya la ruta completa, ej: "uploads/image.jpg"
    await bucket.file(fileName).delete();
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(`Error deleting file ${req.params.fileName}:`, error);
    if ((error as any).code === 404) {
      res.status(404).send("File not found");
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

// Marketing API routes
app.get("/marketing/pagespeed", authenticate, async (req, res) => {
  const urlToTest = req.query.url as string;

  if (!urlToTest) {
    return res.status(400).send("Bad Request: Missing 'url' query parameter.");
  }

  try {
    const pagespeedonline = google.pagespeedonline("v5");
    const response = await pagespeedonline.pagespeedapi.runpagespeed({
      url: urlToTest,
      key: process.env.PAGESPEED_KEY, // Accessing the key from .env
      strategy: "DESKTOP", // or MOBILE
    });

    return res.status(200).send(response.data);
  } catch (error) {
    console.error("Error calling PageSpeed Insights API:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// Google Search Console route
app.get("/marketing/searchconsole", authenticate, async (req, res) => {
  // IMPORTANT: Replace with your site's URL as registered in Google Search Console
  const siteUrl = "https://www.emmanuel-contreras.com/";

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./service-account.json", // Path to your service account key
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    const searchconsole = google.searchconsole({ version: "v1", auth });

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(today),
        dimensions: ["query"],
        rowLimit: 20, // Get top 20 queries
      },
    });

    const rows = response.data.rows || [];

    // Calculate totals
    const totals = rows.reduce((acc, row) => {
      acc.clicks = (acc.clicks || 0) + (row.clicks || 0);
      acc.impressions = (acc.impressions || 0) + (row.impressions || 0);
      return acc;
    }, { clicks: 0, impressions: 0, ctr: 0, position: 0 });

    // Avoid division by zero
    if (typeof totals.impressions === 'number' && totals.impressions > 0) {
      totals.ctr = (totals.clicks || 0) / totals.impressions;
    }

    // To calculate the true average position, we need to sum weighted positions and divide by total impressions.
    // This is a simplified average of averages, which is less accurate but sufficient for a dashboard overview.
    const totalPosition = rows.reduce((acc, row) => acc + (row.position || 0), 0);
    if (rows.length > 0) {
      totals.position = totalPosition / rows.length;
    }

    res.status(200).send({
      totals: totals,
      queries: rows,
    });
  } catch (error: any) {
    console.error("Error calling Search Console API:", error);
    // Provide a more specific error message if possible
    if (error.code === 403) {
      res.status(403).json({ message: "Permission denied. Ensure the service account has access to the Search Console property." });
    } else if (error.code === 404) {
      res.status(404).json({ message: `Site not found: ${siteUrl}. Verify the URL is correct.` });
    } else {
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }
});


// Google Analytics route
app.get("/marketing/analytics", authenticate, async (req, res) => {
  // IMPORTANT: Replace with your Google Analytics 4 Property ID
  const propertyId = "365633566";

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "./service-account.json",
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analytics = google.analyticsdata({ version: 'v1beta', auth });

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const response = await analytics.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today),
        }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
      }
    });

    res.status(200).send(response.data);

  } catch (error: any) {
    console.error("Error calling Google Analytics API:", error);
    if (error.code === 403) {
      res.status(403).json({ message: "Permission denied. Ensure the service account has access to the Google Analytics property." });
    } else {
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }
});

// Google Ads route - MOCK DATA
app.get("/marketing/ads", authenticate, async (req, res) => {
  // IMPORTANT: The Google Ads API is complex and the 'googleapis' library is not ideal.
  // A dedicated client library like 'google-ads-api' is recommended for production.
  // This endpoint returns mock data to demonstrate frontend integration.

  try {
    // In a real implementation, you would use the Google Ads API client here.
    // This would involve your Customer ID, authentication, and a GAQL query.

    const mockData = {
      clicks: Math.floor(Math.random() * 1500 + 200),
      impressions: Math.floor(Math.random() * 30000 + 5000),
      cost_micros: Math.floor(Math.random() * 700000000 + 100000000), // Cost in micro-currency (e.g., micro-dollars)
      conversions: Math.floor(Math.random() * 100 + 10),
    };

    res.status(200).send(mockData);

  } catch (error: any) {
    console.error("Error in Google Ads mock endpoint:", error);
    res.status(500).json({ message: "Google Ads API endpoint not fully implemented." });
  }
});


// AI Assistant route
app.post("/assistant", async (req, res) => {
  // For production, you might want to add the 'authenticate' middleware here.
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      res.status(400).send("Bad Request: Missing prompt");
      return;
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.error("GEMINI_API_KEY not set.");
      res.status(500).send("Internal Server Error: API key not configured.");
      return;
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
      systemInstruction: "You are a helpful and general-purpose AI assistant. Answer any questions the user has to the best of your ability.",
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).send({ text });

  } catch (error) {
    console.error("Error in AI Assistant route:", error);
    res.status(500).send("Internal Server Error while generating content.");
  }
});

export const api = onRequest(app);
