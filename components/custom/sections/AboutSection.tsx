import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

interface AboutSectionProps {
 about:PortfolioData['about'] 
}

export const AboutSection = ({about}:AboutSectionProps) => {
  return (
    <div>AboutSection</div>
  )
}
