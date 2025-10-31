"use client"

import { usePathname, useRouter } from "next/navigation"
import NavButton from "./nav-button";
import { useMedia } from "react-use";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

const routes = [
    {
        href: "/",
        label: "Overview"
    },
    {
        href: "/transactions",
        label: "Transactions"
    },
    {
        href: "/accounts",
        label: "Accounts"
    },
    {
        href: "/categories",
        label: "Categories"
    },
    {
        href: "/settings",
        label: "Settings"
    },
]

const Navigation = () => {
    const [open , setIsOpen] = useState(false)
    const router = useRouter();
    const isMobile = useMedia("(max-width: 1024px)", false)
    const pathname = usePathname();

    const onClick = (href: string) => {
        router.push(href);
        setIsOpen(false);
    }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
        {routes.map((route) => (
            <NavButton 
            key={route.href} 
            href= {route.href}
            label={route.label}
            isActive={pathname === route.href}
            />
        ))}
    </nav>
  )
}

export default Navigation