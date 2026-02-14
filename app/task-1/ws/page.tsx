"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type statusProps = "connected" | "disconnected" | "connecting" | "error";

const lerp = (start: number, end: number, progress: number) => {
  return start + (end - start) * progress;
};

const WS = () => {
  const [status, setStatus] = useState<statusProps>("connecting");

  const startRefs = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const targetRefs = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const rafRefs = useRef<number[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animStartRefs = useRef<number[]>([]);

  const animate = useCallback((index: number, currentTime: number) => {
    const elapsed = currentTime - animStartRefs.current[index];
    const progress = Math.min(elapsed / 2000, 1);

    const newX = lerp(
      startRefs.current[index].x,
      targetRefs.current[index].x,
      progress,
    );
    const newY = lerp(
      startRefs.current[index].y,
      targetRefs.current[index].y,
      progress,
    );

    if (dotRefs.current[index]) {
      dotRefs.current[index]!.style.left = `${newX}px`;
      dotRefs.current[index]!.style.top = `${newY}px`;
    }

    if (progress < 1) {
      rafRefs.current[index] = requestAnimationFrame((time) =>
        animate(index, time),
      );
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001`);
    const rafIds = rafRefs.current;
    ws.onopen = () => {
      console.log("websocket connection successful");
      setStatus("connected");
    };
    ws.onmessage = (event) => {
      console.log(`received data: `, event.data);
      const data = JSON.parse(event.data);

      for (let i = 0; i < data.length; i++) {
        if (dotRefs.current[i]) {
          startRefs.current[i] = {
            x: parseFloat(dotRefs.current[i]!.style.left) || 0,
            y: parseFloat(dotRefs.current[i]!.style.top) || 0,
          };
        }
        targetRefs.current[i] = { x: data[i].x, y: data[i].y };
        animStartRefs.current[i] = performance.now();

        cancelAnimationFrame(rafRefs.current[i]);

        rafRefs.current[i] = requestAnimationFrame((time) => animate(i, time));
      }
    };
    ws.onclose = () => {
      console.log("ws connection closing", ws.CLOSING);
      setStatus("disconnected");
    };
    ws.onerror = () => {
      setStatus("error");
    };

    return () => {
      ws.close();
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, [animate]);

  const colors = ["from-red-500 to-red-700", "from-blue-500 to-blue-700", "from-green-500 to-green-700"];

  return (
    <div className="w-screen h-screen p-10 bg-linear-to-tl dark:from-purple-950 dark:to-zinc-950">
      <h1 className="text-2xl text-zinc-400 font-bold drop-shadow-sm ">
        STATUS
      </h1>
      <p className="text-green-600 font-semibold text-4xl drop-shadow-sm">
        {status}
      </p>
      <div className="relative w-[500px] h-[500px] border border-gray-200 dark:border-gray-800 rounded-lg">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            ref={(el) => {
              dotRefs.current[index] = el;
            }}
            style={{ position: "absolute", left: 0, top: 0 }}
            className={`w-4 h-4 bg-linear-to-b rounded-full ${colors[index]}`}
          />
        ))}
      </div>
    </div>
  );
};

export default WS;
