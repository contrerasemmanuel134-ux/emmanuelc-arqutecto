"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatConAgente = exports.api = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
// Inicialización de Firebase y CORS
admin.initializeApp();
const corsHandler = (0, cors_1.default)({ origin: true });
// --- API para el Dashboard de Marketing (con Mock Data) ---
const apiApp = (0, express_1.default)();
apiApp.use((0, cors_1.default)({ origin: true }));
// Middleware para simular la verificación de autenticación (opcional pero bueno para la estructura)
apiApp.use((req, res, next) => {
    firebase_functions_1.logger.info(`API Request Received: ${req.path}`);
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
exports.api = (0, https_1.onRequest)(apiApp);
// --- Función Proxy para el Asistente de Cliente ---
exports.chatConAgente = (0, https_1.onRequest)({ cors: true }, (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== "POST") {
            res.status(405).send("Method Not Allowed");
            return;
        }
        const AGENT_API_URL = "https://web-admin-agent-546231550004.us-central1.run.app/api/chatConAgente";
        try {
            const { history } = req.body;
            firebase_functions_1.logger.info("Historial recibido:", history);
            const agentResponse = await fetch(AGENT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history }),
            });
            if (!agentResponse.ok) {
                const errorBody = await agentResponse.text();
                firebase_functions_1.logger.error("Error desde la API del agente:", agentResponse.status, errorBody);
                res.status(500).json({ error: "Hubo un error al comunicarse con el agente." });
                return;
            }
            const responseData = await agentResponse.json();
            res.status(200).json({ response: responseData.response });
        }
        catch (error) {
            firebase_functions_1.logger.error("Error interno en la función proxy:", error);
            res.status(500).json({ error: "Error interno del servidor." });
        }
    });
});
//# sourceMappingURL=index.js.map