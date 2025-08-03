"use client"
import { motion, useAnimation, useInView } from "framer-motion" // Changed from "motion/react" to "framer-motion"
import { useEffect, useRef } from "react"
import type { JSX } from "react/jsx-runtime" // Declared JSX variable

interface BoxRevealProps {
  children: JSX.Element
  width?: "fit-content" | "100%"
  boxColor?: string
  duration?: number
  delay?: number // Added delay prop
}

export const BoxReveal = ({
  children,
  width = "fit-content",
  boxColor = "#5046e6", // Default fallback color
  duration,
  delay = 0, // Default delay
}: BoxRevealProps) => {
  const mainControls = useAnimation()
  const slideControls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      slideControls.start("visible")
      mainControls.start("visible")
    } else {
      // Optional: reset animation if not in view and you want it to re-animate on scroll back
      // slideControls.start("hidden");
      // mainControls.start("hidden");
    }
  }, [isInView, mainControls, slideControls])

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ? duration : 0.5, delay: delay + 0.25 }} // Added delay
      >
        {children}
      </motion.div>
      <motion.div
        variants={{
          hidden: { left: 0 },
          visible: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: duration ? duration : 0.5, ease: "easeIn", delay: delay }} // Added delay
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
        className="bg-primary"
      />
    </div>
  )
}
