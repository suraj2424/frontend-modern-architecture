# TASK-1
- Learning Real-Time Updates Without Page Reload

**Approach 1** 
1. Polling

- there is one backend route
- we are getting data from backend route in frontend and changing the data in frontend
- but data gets stored on website everytime data gets fetched overall increasing weight on website overtime

- INEFFICIENT

*Drawbacks*
1. stale data
- out of all requests 80% of requests are wasted,
```text
Browser: "Any updates?"     → Server: "No"
Browser: "Any updates?"     → Server: "No"
Browser: "Any updates?"     → Server: "No"
Browser: "Any updates?"     → Server: "Yes! Here's data"
Browser: "Any updates?"     → Server: "No"
```

**STATEMENT**
```text
Imagine the server gets new data at this moment:

Timeline:
────────────────────────────────────────────►
0s      1s      2s      3s      4s

Your polling:  fetch   fetch   fetch   fetch
               ↑               ↑
               |               |
Server changes data HERE at 0.1 seconds
               |
               You don't know until 2.0 seconds
               
DELAY = up to 2 seconds of stale data

"Make it faster! Poll every 100ms!"
→ Sure, now delay is 100ms
→ But now you make 600 requests per minute PER USER
→ Server dies faster 💀

YOU CANNOT HAVE BOTH:
- Fast updates
- Low server load
WITH POLLING. Pick one.
```


**Approach 2**
2. SSE (Server Sent Events)

- client makes a request over a route on server
- server sents stream of data
- connection keeps active

```text
SSE:
Browser: GET /api/stream → Server responds... 
                           but KEEPS the connection OPEN
                           sends data chunk 1...
                           sends data chunk 2...
                           sends data chunk 3...
                           connection stays open forever

The browser uses EventSource API to listen:
const source = new EventSource("/api/stream");
source.onmessage = (event) => {
    // server pushed new data!
    console.log(event.data);
};
```


Method      | Requests | Direction  | Delay      | Complexity
------------|----------|------------|------------|----------
Polling     | Many     | Both       | Up to Ns   | Simple
SSE         | One      | Server→Client | Instant | Medium  
WebSocket   | One      | Both       | Instant    | Complex



#### But SSE Has a Limitation

```text
SSE is ONE-WAY:

Server → Browser    ✅ server can push data
Browser → Server    ❌ browser CANNOT send back

What if the user wants to SEND something?
Like: "Hey server, I moved to a new area, 
       show me different vehicles"

With SSE you'd need a SEPARATE fetch request for that.
Two channels: SSE for receiving + fetch for sending.

WebSocket solves this:
Server → Browser    ✅
Browser → Server    ✅
Both ways on ONE connection.
```

**Approach 3**
3. Using Websockets

```text
              Polling         SSE            WebSocket
              
Requests      Many            One            One
Direction     Client asks     Server pushes  Both ways
Connection    Opens/closes    Stays open     Stays open
              repeatedly      (one-way)      (two-way)
Server load   High            Low            Low
Delay         Up to N sec     Instant        Instant
Complexity    Simple          Medium         Medium
Browser API   fetch           EventSource    WebSocket
```
