"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

function parseColor(color: string): { r: number; g: number; b: number } | null {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  try {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const imageData = ctx.getImageData(0, 0, 1, 1).data
    return { r: imageData[0], g: imageData[1], b: imageData[2] }
  } catch {
    return null
  }
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const [primaryColor, setPrimaryColor] = useState("rgba(45, 212, 191, OPACITY)")
  const mouse = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  useEffect(() => {
    const detectPrimaryColor = () => {
      try {
        const rootStyles = getComputedStyle(document.documentElement)
        const primaryFromRoot = rootStyles.getPropertyValue('--primary').trim()
        if (primaryFromRoot) {
          const parsed = parseColor(primaryFromRoot)
          if (parsed) {
            setPrimaryColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, OPACITY)`)
            return
          }
        }

        const testDiv = document.createElement("div")
        testDiv.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 1px;
          height: 1px;
          background-color: var(--primary);
          visibility: hidden;
        `
        document.body.appendChild(testDiv)
        testDiv.offsetHeight
        const computedBg = getComputedStyle(testDiv).backgroundColor
        document.body.removeChild(testDiv)

        if (computedBg && computedBg !== "rgba(0, 0, 0, 0)" && computedBg !== "transparent") {
          const parsed = parseColor(computedBg)
          if (parsed) {
            setPrimaryColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, OPACITY)`)
            return
          }
        }

        const elementsWithPrimary = document.querySelectorAll('[class*="primary"], [class*="bg-primary"]')
        for (const el of elementsWithPrimary) {
          const styles = getComputedStyle(el)
          const bgColor = styles.backgroundColor
          const textColor = styles.color
          for (const color of [bgColor, textColor]) {
            if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
              const parsed = parseColor(color)
              if (parsed) {
                setPrimaryColor(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, OPACITY)`)
                return
              }
            }
          }
        }
      } catch (err) {
        console.error("Color detection error:", err)
      }
    }

    const timer = setTimeout(detectPrimaryColor, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const density = 8000
      const count = Math.floor((canvas.width * canvas.height) / density)
      particlesRef.current = []

      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.4,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i]

        // Add gentle continuous drift
        p.vx += (Math.random() - 0.5) * 0.02
        p.vy += (Math.random() - 0.5) * 0.02

        // Mouse attraction (subtle)
        if (mouse.current.x !== null && mouse.current.y !== null) {
          const dx = mouse.current.x - p.x
          const dy = mouse.current.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 100

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.004
            p.vx += dx * force
            p.vy += dy * force
          }
        }

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Damping
        p.vx *= 0.98
        p.vy *= 0.98

        // Prevent full stop
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.05
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.05

        // Bounce on edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = primaryColor.replace("OPACITY", p.opacity.toFixed(2))
        ctx.fill()

        // Connect particles
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const q = particlesRef.current[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            const lineOpacity = (0.12 * (1 - distance / 100)).toFixed(2)
            ctx.strokeStyle = primaryColor.replace("OPACITY", lineOpacity)
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    resize()
    createParticles()
    animate()

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const onLeave = () => {
      mouse.current.x = null
      mouse.current.y = null
    }

    window.addEventListener("resize", () => {
      resize()
      createParticles()
    })
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [primaryColor])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}
