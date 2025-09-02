"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
admin.initializeApp();
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
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map