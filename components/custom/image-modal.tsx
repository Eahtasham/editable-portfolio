"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Github } from "lucide-react"
import { useEffect } from "react"

interface ImageModalProps {
  image: { image: string; link?: string; github?: string } | null
  onClose: () => void
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (image) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [image, onClose])

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/80 hover:bg-background transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>

            {/* Image Container */}
            <div className="relative w-full flex-1 overflow-auto">
              <Image
                src={image.image || "/placeholder.svg"}
                alt="Project preview"
                width={1200}
                height={800}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* CTA Buttons */}
            {(image.link || image.github) && (
              <div className="flex gap-3 p-4 sm:p-6 border-t border-border/30 bg-card">
                {image.link && (
                  <a
                    href={image.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-medium text-sm sm:text-base"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Visit Project
                  </a>
                )}
                {image.github && (
                  <a
                    href={image.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors font-medium text-sm sm:text-base"
                  >
                    <Github className="h-5 w-5" />
                    View Code
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
