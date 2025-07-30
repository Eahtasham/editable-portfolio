import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

interface SkillsSectionProps {
  skills: PortfolioData['skills']
}

export const SkillsSection = ({skills}:SkillsSectionProps) => {
  return (
    <div>SkillsSection</div>
  )
}
