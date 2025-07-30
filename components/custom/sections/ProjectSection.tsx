import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

interface ProjectSectionProps {
    projects: PortfolioData['projects']
}

export const ProjectSection = ({projects}:ProjectSectionProps) => {
  return (
    <div>ProjectSection</div>
  )
}
