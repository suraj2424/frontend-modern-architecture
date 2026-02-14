import { NextResponse } from "next/server";

export function GET(){
    const MAX = 100;
    const random = Math.floor(Math.random()*MAX);

    return NextResponse.json({
        number: random,
    })
}