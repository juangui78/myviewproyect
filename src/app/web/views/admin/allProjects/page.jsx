"use client"
import React, { useEffect } from "react";

const Page = () => {

    useEffect(() => {
        document.title = "MyView_ | Proyectos"
    }, [])

    return (
        <div className="flex justify-center  h-screen w-full">
            <div className="w-[0%] mt-[40px] bg-[#fff]">hola</div>
        </div>
    )
}

export default Page;