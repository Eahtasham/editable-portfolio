"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { TechIcon } from "./tech-icon"

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number | string
    name: string
    techName: string // Added techName for TechIcon
  }[]
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | string | null>(null)
  const springConfig = { stiffness: 100, damping: 15 }
  const x = useMotionValue(0)
  const animationFrameRef = useRef<number | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]) // Create a ref for each item's div

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig)
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      const currentItemRef = itemRefs.current[index]
      if (currentItemRef) {
        const halfWidth = currentItemRef.offsetWidth / 2
        x.set(event.nativeEvent.offsetX - halfWidth)
      }
    })
  }

  return (
    <>
      {items.map((item, idx) => (
        <div
          className="-ml-2 first:ml-0 group relative flex items-center justify-center"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => handleMouseMove(e, idx)} // Pass index to handler
          ref={(el: any) => (itemRefs.current[idx] = el)} // Assign ref to the div
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-18 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-card px-4 py-2 text-xs shadow-xl border border-border"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-accent to-transparent" />
                <div className="relative z-30 text-base font-bold text-foreground">{item.name}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <TechIcon
            techName={item.techName}
            size={40}
            className="relative h-10 w-10 rounded-full border-2 border-border object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  )
}
