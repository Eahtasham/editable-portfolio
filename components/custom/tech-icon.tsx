"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { getDeviconUrl } from "@/lib/portfolio-api"

interface TechIconProps {
  techName: string
  size?: number
  className?: string
}

export const TechIcon: React.FC<TechIconProps> = ({ techName, size = 16, className }) => {
  const [imageError, setImageError] = useState(false)
  const iconSrc = getDeviconUrl(techName)

  if (imageError) {
    return (
      <span
        className={`text-muted-foreground text-xs font-mono flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title={`Icon for ${techName} not found`}
      >
        {"</>"}
      </span>
    )
  }

  return (
    <Image
      src={iconSrc || "/placeholder.svg"}
      alt={techName}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setImageError(true)}
      // Optional: Add a loading spinner or placeholder if desired
      // placeholder="blur" // Requires blurDataURL
      // blurDataURL="/placeholder.svg"
    />
  )
}
