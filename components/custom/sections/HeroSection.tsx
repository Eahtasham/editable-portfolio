import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

export interface HeroSectionProps {
  hero: PortfolioData['hero']  
}

export const HeroSection = ({hero}:HeroSectionProps) => {
  return (
    <div>HeroSection</div>
  )
}
