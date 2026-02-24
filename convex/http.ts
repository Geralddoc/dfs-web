import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/importData",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            // Must handle CORS since the utility is hosted somewhere else (like GitHub Pages or file://)
            if (request.method === "OPTIONS") {
                return new Response(null, {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type",
                    },
                });
            }

            const body = await request.json();

            if (body.type === "batchCreateFarmers") {
                await ctx.runMutation(api.farmers.batchCreate, { farmers: body.data });
            } else if (body.type === "batchCreateProcessors") {
                await ctx.runMutation(api.agroProcessors.batchCreate, { processors: body.data });
            } else {
                return new Response("Unknown Import Type", { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
            }

            return new Response("Success", {
                status: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
            });
        } catch (e) {
            console.error(e);
            return new Response("Error Processing Data", {
                status: 500,
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        }
    }),
});

// Explicit OPTIONS handler for pre-flight requests
http.route({
    path: "/importData",
    method: "OPTIONS",
    handler: httpAction(async (ctx, request) => {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }),
});

export default http;
