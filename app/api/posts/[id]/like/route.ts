import { posts } from "@/lib/ui-updates/data";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const awaitedParams = await params;
  const id = parseInt(awaitedParams.id);
  console.log("Post ID: ", id);
  try {
    // find post from /posts/route.ts file?
    // done

    const post = posts.find((p) => p.id === id);
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found." }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    // Add this BEFORE toggling:
    await new Promise((r) => setTimeout(r, 1000));

    // Random failure
    // if (Math.random() > 0.5) {
    //   return new Response(JSON.stringify({ error: "Server error" }), {
    //     status: 500,
    //   });
    // }

    // return new Response(JSON.stringify({ error: "Server error" }), {
    //   status: 500,
    // });

    // toggle like status
    post.isLiked = !post.isLiked;
    // update like count
    post.likes += post.isLiked ? 1 : -1;

    return new Response(
      JSON.stringify({ message: "Like status updated successfully.", post }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error updating like status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update like status." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
