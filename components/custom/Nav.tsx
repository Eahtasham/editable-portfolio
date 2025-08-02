"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Moon, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"

interface NavProps {
  sections: string[]
}

export function Nav({ sections }: NavProps) {
  const [activeSection, setActiveSection] = useState("hero")
  const [visible, setVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { theme, setTheme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sections])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <motion.div
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 w-full"
    >
      {/* Desktop Navigation */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px hsl(var(--muted) / 0.06), 0 1px 1px hsl(var(--border) / 0.05), 0 0 0 1px hsl(var(--border) / 0.04), 0 0 4px hsl(var(--muted) / 0.08), 0 16px 68px hsl(var(--muted) / 0.05), 0 1px 0 hsl(var(--background) / 0.1) inset"
            : "none",
          width: visible ? "60%" : "100%",
          borderRadius: visible ? "9999px" : "0px",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        style={{
          minWidth: "800px",
        }}
        className={cn(
          "relative z-[60] mx-auto hidden w-full flex-row items-center justify-between self-start bg-card/95 border-b border-border/50 px-4 py-4 lg:flex",
          visible && "bg-card/90 border border-border/80 rounded-full py-2"
        )}
      >
        {/* Logo */}
        <div className="relative z-20 flex items-center space-x-2 px-2 py-1 flex-shrink-0">
          <div className="font-bold text-xl text-foreground">Portfolio</div>
        </div>

        {/* Navigation Items */}
        <motion.div
          onMouseLeave={() => setHoveredIndex(null)}
          className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 lg:flex lg:space-x-2"
        >
          {sections.map((section, idx) => (
            <button
              key={section}
              onMouseEnter={() => setHoveredIndex(idx)}
              onClick={() => scrollToSection(section)}
              className={cn(
                "relative px-4 py-2 capitalize transition-colors",
                activeSection === section ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {(hoveredIndex === idx || activeSection === section) && (
                <motion.div
                  layoutId="hovered"
                  className="absolute inset-0 h-full w-full rounded-full bg-primary"
                />
              )}
              <span className="relative z-20">{section}</span>
            </button>
          ))}
        </motion.div>

        {/* Theme Toggle */}
        <div className="relative z-20 flex-shrink-0">
          <motion.button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-md bg-primary px-3 py-2 text-primary-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 shadow-[0_0_24px_hsl(var(--muted)/0.06),_0_1px_1px_hsl(var(--border)/0.05),_0_0_0_1px_hsl(var(--border)/0.04),_0_0_4px_hsl(var(--muted)/0.08),_0_16px_68px_hsl(var(--muted)/0.05),_0_1px_0_hsl(var(--background)/0.1)_inset]"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px hsl(var(--muted) / 0.06), 0 1px 1px hsl(var(--border) / 0.05), 0 0 0 1px hsl(var(--border) / 0.04), 0 0 4px hsl(var(--muted) / 0.08), 0 16px 68px hsl(var(--muted) / 0.05), 0 1px 0 hsl(var(--background) / 0.1) inset"
            : "none",
          width: visible ? "90%" : "100%",
          paddingRight: visible ? "12px" : "0px",
          paddingLeft: visible ? "12px" : "0px",
          borderRadius: visible ? "16px" : "0px",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-50 mx-auto flex w-full flex-col items-center justify-between bg-card/95 border-b border-border/50 px-0 py-2 lg:hidden",
          visible && "bg-card/90 border border-border/80 rounded-2xl"
        )}
      >
        {/* Mobile Header */}
        <div className="flex w-full flex-row items-center justify-between px-4">
          <div className="font-bold text-xl text-foreground">Portfolio</div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-foreground hover:bg-muted"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? (
                <X className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="flex w-full flex-col items-start justify-start gap-2 rounded-lg bg-card/98 backdrop-blur-sm px-4 py-6 mt-4 border border-border/50 shadow-[0_0_24px_hsl(var(--muted)/0.06),_0_1px_1px_hsl(var(--border)/0.05),_0_0_0_1px_hsl(var(--border)/0.04),_0_0_4px_hsl(var(--muted)/0.08),_0_16px_68px_hsl(var(--muted)/0.05),_0_1px_0_hsl(var(--background)/0.1)_inset]">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={cn(
                      "w-full rounded-md px-4 py-3 text-left text-sm font-medium capitalize transition-colors",
                      activeSection === section
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}