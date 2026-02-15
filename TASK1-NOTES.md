# Task 1: Real-Time Data & Smooth Animation
---

## 1. THREE WAYS TO GET REAL-TIME DATA

### 1.1 Polling (Simplest, Most Wasteful)

**How it works:**
- Browser asks server for data every N seconds using `setInterval + fetch`
- Server responds and connection CLOSES
- Browser asks again after N seconds

**When to use:**
- Simple dashboards
- Data that changes rarely
- When you don't control the backend

**Problems:**
- Wasted requests (80% might return same data)
- Scale problem: 10,000 users × 30 req/min = 300,000 req/min
- Delay: up to N seconds of stale data
- You CANNOT have both fast updates AND low server load

**Code pattern:**
```tsx
useEffect(() => {
    const fetchData = async () => {
        const res = await fetch("/api/data");
        const data = await res.json();
        setState(data);
    };

    fetchData(); // fetch immediately on mount
    const timer = setInterval(fetchData, 2000);

    return () => clearInterval(timer); // cleanup
}, []);
```

**Network tab behavior:** Multiple requests piling up every N seconds.


### 1.2 Server-Sent Events (SSE) — One-Way Push

**How it works:**
- Browser opens ONE connection
- Server keeps it open and pushes data whenever it wants
- Connection stays open forever
- One-way: server → browser only

**When to use:**

- Live feeds, notifications, stock prices
- When client only RECEIVES data (doesn't send back)
- When you want simplicity over WebSockets

**Problems:**

- One-way only (browser can't send data back through same connection)
- Need separate fetch for sending data to server
- Limited browser connections per domain (6 in HTTP/1.1)

**Server code pattern:**
```tsx
// API route: app/api/stream/route.ts
export function GET() {
    const encoder = new TextEncoder();
    let interval: NodeJS.Timeout; // declare OUTSIDE for cleanup access

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (data: string) => {
                // SSE format: "data: ...\n\n" (MUST have data: prefix and double newline)
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            };

            sendEvent(JSON.stringify({ number: 42 }));

            interval = setInterval(() => {
                sendEvent(JSON.stringify({ number: Math.random() }));
            }, 1000);
        },
        cancel() {
            // Called when client disconnects
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
```

**Client code pattern:**
```tsx
useEffect(() => {
    const source = new EventSource('/api/stream');

    source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setState(data.number);
    };

    return () => source.close(); // cleanup
}, []);
```

**Network tab behavior:** ONE request that stays open, data streams through it.

**⚠️ Common mistake:** Using `return () => {}` inside ReadableStream's `start()`.
That does NOTHING. Only `useEffect` uses return for cleanup.
Use the `cancel()` method instead.


### 1.3 WebSockets — Two-Way Persistent Connection

**How it works:**
- Browser opens persistent connection
- Both browser AND server can send data anytime
- Like a phone call that stays connected
- Lowest latency, most efficient

**When to use:**
- Chat apps, multiplayer games
- Live tracking (Uber, food delivery)
- Collaborative editing (Google Docs)
- Anything needing two-way real-time communication

**Server code (using `ws` library):**

```tsx
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (socket) => {
    console.log("Client connected!");

    // Send data to client
    socket.send(JSON.stringify({ x: 100, y: 200 }));

    // Receive data from client
    socket.on("message", (msg) => {
        console.log("Received:", msg.toString());
    });

    // Start sending periodic updates
    const timer = setInterval(() => {
        socket.send(JSON.stringify({ x: Math.random() * 500 }));
    }, 2000);

    // Cleanup when client disconnects
    socket.on("close", () => {
        console.log("Client disconnected!");
        clearInterval(timer);
    });
});
```

**Client code (browser's built-in WebSocket):**
```tsx
useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => setStatus("connected");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // handle data
    };
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("error");

    return () => ws.close(); // cleanup
}, []);
```

**⚠️ Browser WebSocket vs Socket.IO:**
```text
Browser WebSocket (built-in, no import needed):
  ws.onopen = () => {}
  ws.onmessage = () => {}
  ws.onclose = () => {}

Socket.IO (library, needs import):
  socket.on("connect", () => {})
  socket.on("event-name", () => {})
  socket.on("disconnect", () => {})

They are DIFFERENT APIs. Learn browser WebSocket first.
```

## 2. COMPARISON TABLE
```text
Feature         | Polling        | SSE              | WebSocket
Direction       | Both (manual)  | Server → Client  | Both
Requests        | Many           | One              | One
Connection      | Opens/closes   | Stays open       | Stays open
Delay           | Up to N sec    | Instant          | Instant
Server load     | High           | Low              | Low
Complexity      | Simple         | Medium           | Medium
Browser API     | fetch          | EventSource      | WebSocket
```

## 3. useEffect - THE MOST IMPORTANT HOOK
**What it does:**
Runs "side effects" — any code that talks to the outside world
(API calls, timers, WebSocket connections, subscriptions).

**Dependency array controls WHEN it runs:**
```tsx
useEffect(() => {}, [])          // Run ONCE on mount. Never again.
useEffect(() => {}, [count])     // Run on mount AND when count changes.
useEffect(() => {})              // Run on EVERY render. ❌ Almost never wanted.
```

**Cleanup function — CRITICAL:**
```tsx
useEffect(() => {
    // setup
    const timer = setInterval(fn, 2000);

    // cleanup — runs when:
    // 1. Component unmounts (user navigates away)
    // 2. Before effect re-runs (if dependencies change)
    return () => {
        clearInterval(timer);
    };
}, []);
```

## My Mistakes

**Mistake 1: setTimeout in component body (not in useEffect)**
```tsx
// ❌ Creates new timeout on EVERY render → infinite loop
export default function Page() {
    setTimeout(() => { fetchData() }, 2000);
}

// ✅ Put it inside useEffect
useEffect(() => {
    const timer = setInterval(fetchData, 2000);
    return () => clearInterval(timer);
}, []);
```

**Mistake 2: Forgetting cleanup**
```text
Without cleanup:
- Navigate away → timer/WebSocket keeps running
- Memory leak
- Fetching data for component that doesn't exist

With cleanup:
- Navigate away → cleanup runs → timer/WebSocket stops
- Clean. No leak.
```

**Mistake 3: Thinking return () => {} works everywhere**
```tsx
// ONLY useEffect uses "return function" for cleanup.

useEffect(() => { return () => {} })           ✅ React calls this
ws.on("connection", () => { return () => {} }) ❌ Ignored
readableStream.start(() => { return () => {} })❌ Ignored
```

**Mistake 4: Calling setState synchronously in effect body (React 19)**
```tsx
// ❌ React 19 strict mode error
useEffect(() => {
    handleFetchData(); // synchronously calls setState inside
}, []);

// ✅ Define async function inside and call it
useEffect(() => {
    const fetchData = async () => {
        const res = await fetch("/api/data");
        const data = await res.json();
        setState(data); // setState happens after await, React is OK
    };
    fetchData();
}, []);
```

## 4. useState vs useRef
```text
useState:
- Stores value
- Changes CAUSE re-render
- Use for: anything the USER needs to SEE change on screen

useRef:
- Stores value
- Changes do NOT cause re-render
- Use for: internal values, DOM references, animation data
```

**When to use which:**
```text
Connection status → useState (user sees "connected"/"error")
Animation position → useRef (changes 60x/sec, don't want 60 re-renders)
Timer ID → useRef (internal, user doesn't see it)
Form input value → useState (user sees it)
DOM element reference → useRef (need direct access)
```

**⚠️ My Mistake:**
```text
Using useState for animation position:
60 state updates/second = 60 re-renders/second
React runs component function, diffs virtual DOM, updates real DOM
ALL WASTED WORK

Using useRef + direct DOM manipulation:
0 re-renders
Just change element.style.left directly
Browser moves the pixel. Done.
```

## 5. requestAnimationFrame — SMOOTH ANIMATION
**What it does:**
Tells browser: "Call my function on the next screen refresh"
Screen refreshes ~60 times/sec = ~60fps animation.

**Why not setInterval?**
```text
setInterval(fn, 16):
- Not synced with screen refresh
- Runs even when tab is hidden (wastes CPU)
- Can cause janky animation

requestAnimationFrame(fn):
- Synced with screen refresh
- Pauses when tab is hidden (saves CPU)
- Smooth animation guaranteed
```

**The animation loop pattern:**
```tsx
const animate = (currentTime: number) => {
    // 1. Calculate how much time passed
    const elapsed = currentTime - startTime;

    // 2. Convert to progress (0 to 1)
    const progress = Math.min(elapsed / duration, 1);

    // 3. Calculate position using lerp
    const newX = lerp(startX, endX, progress);

    // 4. Update DOM directly
    element.style.left = `${newX}px`;

    // 5. Continue if not done
    if (progress < 1) {
        requestAnimationFrame(animate);
    }
};

// Start it:
requestAnimationFrame(animate);

// Cancel it:
cancelAnimationFrame(rafId);
```

## 6. LERP (Linear Interpolation)
**The formula:**
```text
current = start + (end - start) * progress

progress = 0   → returns start
progress = 0.5 → returns middle
progress = 1   → returns end
```

```tsx
function lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
}

lerp(100, 200, 0)    = 100   // at start
lerp(100, 200, 0.25) = 125   // quarter way
lerp(100, 200, 0.5)  = 150   // halfway
lerp(100, 200, 1)    = 200   // at end
```

**Why it matters:**
Server sends position every 2 seconds.
Lerp fills in 120 frames between those 2 positions.
Result: smooth movement instead of jumping.

## 7. MULTIPLE ANIMATED ELEMENTS

**Pattern: Array refs**
```tsx
// Single element:
const dotRef = useRef<HTMLDivElement>(null);

// Multiple elements:
const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

// Attach in JSX:
{items.map((_, index) => (
    <div
        key={index}
        ref={(el) => { dotRefs.current[index] = el }}
    />
))}

// Access:
dotRefs.current[0]  // first element
dotRefs.current[1]  // second element
```

**Animate function with index:**
```tsx
const animate = (index: number, currentTime: number) => {
    // ... lerp using startRefs.current[index] ...

    if (progress < 1) {
        // ⚠️ Must wrap to pass index
        rafRefs.current[index] = requestAnimationFrame(
            (time) => animate(index, time)
        );
    }
};

// Start animation for specific dot:
rafRefs.current[i] = requestAnimationFrame(
    (time) => animate(i, time)
);
```

**⚠️ My Mistake:**
```tsx
// ❌ requestAnimationFrame only passes (time), not (index, time)
requestAnimationFrame(animate);

// ✅ Wrap it to capture index
requestAnimationFrame((time) => animate(index, time));
```

## 8. DATA FORMAT
**Always send JSON, not plain strings:**
```tsx
// ❌ Plain string
socket.send("42");
// Hard to extend. What if you need more fields?

// ✅ JSON
socket.send(JSON.stringify({ number: 42 }));
// Easy to extend: { number: 42, timestamp: 1234 }
```

**Always parse safely:**
```tsx
// If you mix JSON and non-JSON messages:
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        // use data
    } catch {
        console.log("Non-JSON message:", event.data);
    }
};
```

**⚠️ My Mistake:**
```tsx
const data = JSON.parse(event.data); // gives { number: 42 }
setNum(Number(data));                // ❌ Number({...}) = NaN
setNum(data.number);                 // ✅ access the property
```

## 9. COMMON PATTERNS LEARNED

**Singleton Pattern (one instance shared everywhere):**
```text
One WebSocket connection shared across components.
Don't create a new connection per component.
```

**Cleanup Pattern:**
```text
Every setup needs a teardown:
setInterval    → clearInterval
EventSource    → .close()
WebSocket      → .close()
rAF            → cancelAnimationFrame
```

**Clamping (keeping values in bounds):**
```tsx
x = Math.max(0, Math.min(500, x));
// If x < 0 → becomes 0
// If x > 500 → becomes 500
// Otherwise → stays the same

// ⚠️ My Mistake: Clamped into separate variable, not x itself
const X = Math.max(0, Math.min(500, x)); // x stays out of bounds
x = Math.max(0, Math.min(500, x));       // x is properly clamped ✅
```

**Position Tracking (let vs const):**
```tsx
// ❌ const — position never accumulates
const x = 250;
x = x + random; // ERROR: can't reassign const

// ✅ let — position accumulates over time
let x = 250;
x = x + random; // x grows: 250 → 265 → 255 → 270
```

## 10. DEBUGGING CHECKLIST
When real-time features don't work:

```text
□ Check URL: Does client URL match server endpoint?
□ Check port: Is the server actually running?
□ Check Network tab: Are requests being made?
□ Check Console: Any errors?
□ Check data format: JSON.parse working correctly?
□ Check property names: data.num vs data.number?
□ Check cleanup: Are old intervals/connections being cleared?
□ Check refs: Is dotRef.current null? (element not mounted yet?)
```
