// components/HomePage.tsx
"use client";

import React from 'react';
import { PortfolioData, PortfolioProvider } from '../../context/PortfolioContext';
import ThemeTestPage from './page-content';




export default function HomePage() {
  return (
    // <PortfolioProvider initialData={data}>
      <div className="min-h-screen bg-background text-foreground">
        <ThemeTestPage />
        {/* <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection /> */}
      </div>
    // </PortfolioProvider>
  );
}