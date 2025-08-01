"use client"

import { usePortfolio } from "@/context/PortfolioContext"


export function Footer() {
  const { data } = usePortfolio()

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} {data.hero.heading.split("I'm ")[1]}. All rights reserved.
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">Built with Next.js & Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
