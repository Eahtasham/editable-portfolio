"use client"
import { motion } from "framer-motion"
import type React from "react"

import { Mail, Twitter, Github, Linkedin } from "lucide-react" // Common social icons
import { usePortfolio } from "@/context/PortfolioContext"



const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export const Footer = () => {
  const { data} = usePortfolio();
  const hero = data.hero;
  const contacts = data.contacts;

  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "github":
        return Github
      case "linkedin":
        return Linkedin
      case "twitter":
        return Twitter
      case "mail":
        return Mail
      default:
        return null // Or a generic placeholder icon
    }
  }

  return (
    <motion.footer
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border/50 mt-12 bg-background"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {hero.heading.split(",")[0].replace("Hi, I'm ", "")}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {contacts.email && (
            <a
              href={`mailto:${contacts.email}`}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              aria-label="Email me"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          )}
          {hero.socialLinks &&
            hero.socialLinks.map((link) => {
              const IconComponent = getIconComponent(link.icon)
              return IconComponent ? (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  aria-label={`Visit my ${link.name}`}
                >
                  <IconComponent className="h-4 w-4" />
                  {link.name}
                </a>
              ) : null
            })}
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
