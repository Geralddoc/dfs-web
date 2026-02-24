import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/importData",
    method: "POST",
    handler: httpAction(async (ctx: any, request: any) => {
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
    handler: httpAction(async (ctx: any, request: any) => {
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

// GET Endpoint for Farmers
http.route({
    path: "/getFarmers",
    method: "GET",
    handler: httpAction(async (ctx: any, request: any) => {
        try {
            const farmers = await ctx.runQuery(api.farmers.get);
            return new Response(JSON.stringify(farmers), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (e) {
            console.error(e);
            return new Response("Error fetching farmers", { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }),
});

// GET Endpoint for Processors
http.route({
    path: "/getProcessors",
    method: "GET",
    handler: httpAction(async (ctx: any, request: any) => {
        try {
            const processors = await ctx.runQuery(api.agroProcessors.get);
            return new Response(JSON.stringify(processors), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (e) {
            console.error(e);
            return new Response("Error fetching processors", { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
        }
    }),
});

export default http;
