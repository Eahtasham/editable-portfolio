"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", mouseMove)

    return () => {
      window.removeEventListener("mousemove", mouseMove)
    }
  }, [])


  return (
    <motion.div
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
      }}
      transition={{
        type: "spring",
        mass: 0.1,
        stiffness: 100,
        damping: 10,
      }}
      className="fixed top-0 left-0 size-4 rounded-full bg-primary pointer-events-none z-[9999] opacity-0 sm:opacity-90"
    />
  )
}
