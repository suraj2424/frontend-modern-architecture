import { WebSocketServer } from "ws";

const ws = new WebSocketServer({ port: 3001 });

const PORT = 3001;

interface positionProps{
    x: number;
    y:number;
}

type arrayProps = positionProps[];

ws.on("connection", (socket)=> {
    console.log("Client connected!");

    const arr: arrayProps = [];

    const n = 3;

    for(let i=0; i<n; i++) {
        arr.push({ x: Math.floor(Math.random()*500), y: Math.floor(Math.random()*500) });
    }

    const initialData = JSON.stringify(arr)

    socket.send(initialData);

    function getRandomInclusive(min:number, max:number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    const timer = setInterval(()=>{

        for(let i=0; i<arr.length; i++) {
            arr[i].x = arr[i].x + getRandomInclusive(-50,50);
            arr[i].y = arr[i].y + getRandomInclusive(-50,50);

            arr[i].x = Math.max(0, Math.min(500,arr[i].x));
            arr[i].y = Math.max(0, Math.min(500,arr[i].y));
        }

        const data = JSON.stringify(arr);

        socket.send(data);
    }, 2000)


    socket.onerror = (socket) => {
        console.log(socket.error);
    }

    socket.on("close", ()=> {
        console.log("Client disconnected!")
        clearInterval(timer);
    })
})

console.log(`Server is running on PORT: `, PORT);