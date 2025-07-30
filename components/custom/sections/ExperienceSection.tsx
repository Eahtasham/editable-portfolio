import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

interface ExperienceSectionProps {
  experience: PortfolioData['experience']  
}


export const ExperienceSection = ({experience}:ExperienceSectionProps) => {
  return (
    <div>ExperienceSection</div>
  )
}
