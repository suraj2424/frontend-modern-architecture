"use client"
import { useEffect, useState } from "react"

const SSE = () => {
    const [num, setNum] = useState(0);

    useEffect(() => {
        const eventSource = new EventSource('/api/sse')
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setNum(Number(data.number))
        }
        
        return () => {
            eventSource.close()  // Add cleanup
        }
}, [])


    return (
        <div className="w-screen h-screen p-10 bg-linear-to-tl from-purple-100 to-zinc-50 dark:from-purple-950 dark:to-zinc-950">
            <h1 className="text-2xl text-zinc-600 dark:text-zinc-400 font-bold drop-shadow-sm ">FETCHED NUMBER</h1>
            <p className="text-purple-600 font-semibold text-4xl drop-shadow-sm">{num}</p>
        </div>
    )
}

export default SSE;