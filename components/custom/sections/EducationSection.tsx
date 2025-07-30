import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

interface EducationSectionProps {
  education: PortfolioData['education']
}

export const EducationSection = ({education}:EducationSectionProps) => {
  return (
    <div>EducationSection</div>
  )
}
