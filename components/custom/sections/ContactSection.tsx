import { PortfolioData } from '@/context/PortfolioContext'
import React from 'react'

interface ContactSectionProps {
 contacts:PortfolioData['contacts'] 
}

export const ContactSection = ({contacts}:ContactSectionProps) => {
  return (
    <div>ContactSection</div>
  )
}
