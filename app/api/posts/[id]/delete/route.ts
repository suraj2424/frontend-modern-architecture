import { posts } from "@/lib/ui-updates/data";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const awaitedParams = await params;
    const id = parseInt(awaitedParams.id);
    console.log("Post ID to delete: ", id);

    try {
        const post = posts.find((p)=> p.id === id);
        if(!post) {
            return new Response(JSON.stringify({ error: "Post not found." }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

        // Remove post from array
        const index = posts.findIndex((p) => p.id === id);

        // fake delay to simulate network latency and test optimistic UI updates
        await new Promise((r)=> setTimeout(r, 1000));
        
        // Simulate random failure to test error handling in optimistic UI updates
        // if(Math.random() > 0.5) {
        //     return new Response(JSON.stringify({ error: "Server error"}),{
        //         status: 500,
        //         headers: {
        //             "Content-Type": "application/json",
        //         }
        //     })
        // }

        // Remove the post from the array
        posts.splice(index, 1);

        // Return success response
        return new Response(JSON.stringify({ message: "Post deleted successfully." }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        console.error("Error deleting post: ", error);
    }
}