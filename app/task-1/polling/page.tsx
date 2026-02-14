"use client";

import {useEffect, useState } from "react";

export default function Task1() {
    const [num,setNum] = useState(0);

    useEffect(()=> {
        let isCancelled = false;
        const fetchData = async () => {
            const res = await fetch("/api/polling");
            const data = await res.json();
            if(!isCancelled) {
                setNum(data.number);
            }
        }
        fetchData();
        const timer = setInterval(fetchData, 2000);
        return () => {
            isCancelled = true;
            clearInterval(timer)
        }

    }, [])

    return (
        <div className="w-screen h-screen p-10 bg-linear-to-tl dark:from-purple-950 dark:to-zinc-950">
            <h1 className="text-2xl text-zinc-400 font-bold drop-shadow-sm ">FETCHED NUMBER</h1>
            <p className="text-purple-600 font-semibold text-4xl drop-shadow-sm">{num}</p>
        </div>
    )
}
