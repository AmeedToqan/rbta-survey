const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "responses.json");

app.use(express.json({ limit: "100kb" }));
app.use(express.static(__dirname));

function readResponses() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, "[]", "utf8");
        }

        const raw = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(raw || "[]");
    } catch (error) {
        console.error("Read error:", error);
        return [];
    }
}

function writeResponses(data) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

app.post("/api/submit", (req, res) => {

    const d = req.body || {};

    if (!d.idea || !d.usability) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    const response = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: String(d.name || "").slice(0, 100),
        idea: String(d.idea),
        usability: String(d.usability),
        liked: String(d.liked || "").slice(0, 3000),
        improve: String(d.improve || "").slice(0, 3000),
        notes: String(d.notes || "").slice(0, 3000),
        createdAt: new Date().toISOString()
    };

    const responses = readResponses();

    responses.push(response);

    writeResponses(responses);

    res.json({
        ok: true,
        message: "Saved"
    });
});

app.get("/api/responses", (req, res) => {

    const key = req.query.key;

    if (key !== "rbta-admin") {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    res.json(readResponses());
});

app.delete("/api/responses", (req, res) => {

    const key = req.query.key;

    if (key !== "rbta-admin") {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    try {

        writeResponses([]);

        console.log("All responses deleted.");

        res.json({
            ok: true,
            message: "All responses deleted"
        });

    } catch (error) {

        console.error("Delete error:", error);

        res.status(500).json({
            error: "Could not delete responses"
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("RBTA Survey running:");
    console.log("http://localhost:" + PORT);
    console.log("");
    console.log("Admin:");
    console.log("http://localhost:" + PORT + "/admin");
    console.log("");
});
