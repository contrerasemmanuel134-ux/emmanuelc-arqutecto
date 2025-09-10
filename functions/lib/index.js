"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const googleapis_1 = require("googleapis");
admin.initializeApp();
(0, v2_1.setGlobalOptions)({ region: "us-central1" });
const app = express();
app.use(cors({ origin: true }));
// In production, you should restrict the origin to your app's domain.
// Example: app.use(cors({ origin: 'https://your-app-name.firebaseapp.com' }));
// Middleware to verify Firebase ID token.
const authenticate = async (req, res, next) => {
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
    }
    catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(401).send('Unauthorized: Invalid token');
    }
};
// Project CRUD
app.get("/projects", async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("projects").get();
        const projects = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).send(projects);
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Error updating project:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.delete("/projects/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        await admin.firestore().collection("projects").doc(id).delete();
        res.status(200).send({ id });
    }
    catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Blog Post CRUD
app.get("/blogs", async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("blogPosts").orderBy("fechaCreacion", "desc").get();
        const posts = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).send(posts);
    }
    catch (error) {
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
        const post = Object.assign(Object.assign({}, postData), { fechaCreacion: admin.firestore.FieldValue.serverTimestamp() });
        const writeResult = await admin.firestore().collection("blogPosts").add(post);
        res.status(201).send({ id: writeResult.id });
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Error updating blog post:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.delete("/blogs/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        await admin.firestore().collection("blogPosts").doc(id).delete();
        res.status(200).send({ id });
    }
    catch (error) {
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
        const mediaItems = await Promise.all(files.map(async (file) => {
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
        }));
        res.status(200).send(mediaItems);
    }
    catch (error) {
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
    }
    catch (error) {
        console.error(`Error deleting file ${req.params.fileName}:`, error);
        if (error.code === 404) {
            res.status(404).send("File not found");
        }
        else {
            res.status(500).send("Internal Server Error");
        }
    }
});
// Marketing API routes
app.get("/marketing/pagespeed", authenticate, async (req, res) => {
    const urlToTest = req.query.url;
    if (!urlToTest) {
        return res.status(400).send("Bad Request: Missing 'url' query parameter.");
    }
    try {
        const pagespeedonline = googleapis_1.google.pagespeedonline("v5");
        const response = await pagespeedonline.pagespeedapi.runpagespeed({
            url: urlToTest,
            key: process.env.PAGESPEED_KEY, // Accessing the key from .env
            strategy: "DESKTOP", // or MOBILE
        });
        return res.status(200).send(response.data);
    }
    catch (error) {
        console.error("Error calling PageSpeed Insights API:", error);
        return res.status(500).send("Internal Server Error");
    }
});
exports.api = (0, https_1.onRequest)(app);
//# sourceMappingURL=index.js.map