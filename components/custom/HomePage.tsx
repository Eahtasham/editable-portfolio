// components/HomePage.tsx
"use client";

import React from 'react';
import { PortfolioData, PortfolioProvider } from '../../context/PortfolioContext';
import ThemeTestPage from './page-content';


interface HomePageProps {
  data: PortfolioData;
}

export default function HomePage({ data }: HomePageProps) {
  return (
    <PortfolioProvider initialData={data}>
      <div className="min-h-screen bg-background text-foreground">
        <ThemeTestPage />
        {/* <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection /> */}
      </div>
    </PortfolioProvider>
  );
}