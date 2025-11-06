"use client";

import { useUser } from "@clerk/nextjs";

const WelcomeMsg = () => {
    const {user , isLoaded} = useUser();
  return (
    <div className="space-y-2 mb-b">
        <h2 className="text-2xl lg:text-4xl text-white font-medium ">
            Welcome Back {isLoaded ? ", " : " "}{user?.firstName}
        </h2>
        <p className="text-small lg:text-base text-[#89b6FD]">This is you financial overview report</p>
    </div>
  )
}

export default WelcomeMsg