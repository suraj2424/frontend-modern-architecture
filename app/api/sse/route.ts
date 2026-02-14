export function GET() {
    const encoder = new TextEncoder();
    let interval: NodeJS.Timeout;

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (data: string) => {
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            };

            sendEvent(JSON.stringify({ number: Math.floor(Math.random()*100), timestamp: Date.now() }));

            interval = setInterval(() => {
                sendEvent(JSON.stringify({ number: Math.floor(Math.random()*100), timestamp: Date.now() }));
            }, 1000);
        },
        cancel() {
            clearInterval(interval);
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        }
    });
}