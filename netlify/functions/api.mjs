import { getStore } from "@netlify/blobs";

const store = getStore("rbta-responses");
const ADMIN_KEY = process.env.RBTA_ADMIN_KEY || "rbta-admin";

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}

async function getAllResponses() {
    const { blobs } = await store.list();

    const responses = [];

    for (const blob of blobs) {
        const item = await store.get(blob.key, { type: "json" });

        if (item) {
            responses.push(item);
        }
    }

    responses.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return responses;
}

export default async function handler(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    try {

        // POST /api/submit
        if (req.method === "POST" && pathname.endsWith("/submit")) {

            const d = await req.json();

            if (!d.idea || !d.usability) {
                return json({
                    error: "Missing required fields"
                }, 400);
            }

            const response = {
                id:
                    Date.now().toString(36) +
                    Math.random().toString(36).slice(2, 7),

                name: String(d.name || "").slice(0, 100),
                idea: String(d.idea).slice(0, 5000),
                usability: String(d.usability).slice(0, 100),
                liked: String(d.liked || "").slice(0, 3000),
                improve: String(d.improve || "").slice(0, 3000),
                notes: String(d.notes || "").slice(0, 3000),
                createdAt: new Date().toISOString()
            };

            await store.setJSON(
                `response-${response.id}`,
                response
            );

            return json({
                ok: true,
                message: "Saved"
            });
        }


        // GET /api/responses
        if (req.method === "GET" && pathname.endsWith("/responses")) {

            const key = url.searchParams.get("key");

            if (key !== ADMIN_KEY) {
                return json({
                    error: "Unauthorized"
                }, 401);
            }

            return json(await getAllResponses());
        }


        // DELETE /api/responses
        if (req.method === "DELETE" && pathname.endsWith("/responses")) {

            const key = url.searchParams.get("key");

            if (key !== ADMIN_KEY) {
                return json({
                    error: "Unauthorized"
                }, 401);
            }

            const result = await store.deleteAll();

            return json({
                ok: true,
                message: "All responses deleted",
                deleted: result.deletedBlobs
            });
        }


        return json({
            error: "Not found"
        }, 404);

    } catch (error) {

        console.error(error);

        return json({
            error: "Server error"
        }, 500);
    }
}
