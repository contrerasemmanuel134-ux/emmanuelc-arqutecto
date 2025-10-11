
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import cors from "cors";
import express from "express";

// Importa el manejador del servidor de Astro.
// La ruta es relativa desde la carpeta `lib` (donde se compila el código de las funciones)
// a la carpeta `dist` (donde Astro genera el sitio).
// Usamos @ts-ignore porque TypeScript no ve este archivo durante la compilación.
// @ts-ignore
import { handler as astroHandler } from "../../dist/server/entry.mjs";


// Inicialización de Firebase y CORS
admin.initializeApp();
const corsHandler = cors({ origin: true });

// --- API para el Dashboard de Marketing (con Mock Data) ---
const apiApp = express();
apiApp.use(cors({ origin: true }));

// Middleware para simular la verificación de autenticación (opcional pero bueno para la estructura)
apiApp.use((req, res, next) => {
    logger.info(`API Request Received: ${req.path}`);
    // En una app real, aquí verificarías el token de autenticación de Firebase.
    next();
});

apiApp.get('/marketing/searchconsole', (req, res) => {
    res.json({
        totals: { clicks: 1234, impressions: 56789, ctr: 0.0217, position: 15.8 },
        queries: [
            { keys: ['diseño web guadalajara'], clicks: 150, impressions: 2500, ctr: 0.06, position: 5.2 },
            { keys: ['arquitecto digital'], clicks: 95, impressions: 1800, ctr: 0.052, position: 8.1 },
            { keys: ['consultoria web'], clicks: 70, impressions: 3200, ctr: 0.021, position: 12.5 },
        ]
    });
});

apiApp.get('/marketing/pagespeed', (req, res) => {
    res.json({
        lighthouseResult: {
            categories: {
                performance: { score: 0.92 },
                accessibility: { score: 0.98 },
                'best-practices': { score: 1.0 },
                seo: { score: 1.0 }
            }
        }
    });
});

apiApp.get('/marketing/analytics', (req, res) => {
    res.json({
        metricHeaders: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
        rows: [{ metricValues: [{ value: '2500' }, { value: '3100' }, { value: '7800' }] }]
    });
});

apiApp.get('/marketing/ads', (req, res) => {
    res.json({
        clicks: 789,
        impressions: 45000,
        cost_micros: 5234567, // Ejemplo: $5.23
        conversions: 42
    });
});

export const api = onRequest(apiApp);


// --- Función Proxy para el Asistente de Cliente ---
export const chatConAgente = onRequest({ cors: true }, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

        const AGENT_API_URL = "http://127.0.0.1:8081/api/chatConAgente";

    try {
      const { history } = req.body;
      logger.info("Historial recibido:", history);

      const agentResponse = await fetch(AGENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });

      if (!agentResponse.ok) {
        const errorBody = await agentResponse.text();
        logger.error("Error desde la API del agente:", agentResponse.status, errorBody);
        res.status(500).json({ error: "Hubo un error al comunicarse con el agente." });
        return;
      }

      const responseData = await agentResponse.json();
      res.status(200).json({ response: responseData.response });

    } catch (error) {
      logger.error("Error interno en la función proxy:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });
});

// Nueva función para aprobar una propuesta de cambio
export const approveProposal = onCall(async (request) => {
  const { proposalId } = request.data;
  if (!proposalId) {
    throw new HttpsError("invalid-argument", "The function must be called with one argument 'proposalId'.");
  }

  const db = getFirestore();
  const proposalRef = db.collection("propuestas_de_cambio").doc(proposalId);

  try {
    const proposalDoc = await proposalRef.get();
    if (!proposalDoc.exists) {
      throw new HttpsError("not-found", `No proposal found with ID: ${proposalId}`);
    }

    const proposalData = proposalDoc.data();
    if (!proposalData || proposalData.status !== "pendiente") {
      throw new HttpsError("failed-precondition", "Proposal is not pending approval.");
    }

    const {
      target_collection,
      target_document_id,
      target_field,
      proposed_value,
    } = proposalData;

    // Apply the change to the target document
    const targetRef = db.collection(target_collection).doc(target_document_id);
    await targetRef.update({ [target_field]: proposed_value });

    // Update the proposal status to 'aprobada'
    await proposalRef.update({ status: "aprobada" });

    return { result: `Successfully approved and applied proposal ${proposalId}.` };

  } catch (error) {
    logger.error(`Error approving proposal ${proposalId}:`, error);
    if (error instanceof HttpsError) {
      throw error; // Re-throw HttpsError
    }
    throw new HttpsError("internal", "An internal error occurred while approving the proposal.");
  }
});

// --- Servidor SSR de Astro ---
// Esta función sirve la aplicación de Astro usando el middleware generado.
const astroServer = express();
astroServer.use(astroHandler);

export const server = onRequest(astroServer);
