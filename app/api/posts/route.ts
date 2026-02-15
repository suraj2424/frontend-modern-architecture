import { posts } from "@/lib/ui-updates/data";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error reading posts:", error);
        return new Response(JSON.stringify({ error: "Failed to read posts." }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}