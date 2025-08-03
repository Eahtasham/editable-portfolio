"use client"

import { usePortfolio } from "@/context/PortfolioContext"
import { HeroSection } from "./sections/HeroSection"
import { AboutSection } from "./sections/AboutSection"
import { ProjectSection } from "./sections/ProjectSection"
import { ExperienceSection } from "./sections/ExperienceSection"
import { EducationSection } from "./sections/EducationSection"
import { SkillsSection } from "./sections/SkillsSection"
import { ContactSection } from "./sections/ContactSection"
import { Nav } from "./Nav"
import { Footer } from "./Footer"
import { ParticleBackground } from "./particle-background"

export default function HomePage() {
  const { data, loading } = usePortfolio()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const sectionComponents = {
    hero: <HeroSection key="hero" />,
    about: <AboutSection key="about" />,
    projects: <ProjectSection key="projects" />,
    experience: <ExperienceSection key="experience" />,
    education: <EducationSection key="education" />,
    skills: <SkillsSection key="skills" />,
    contacts: <ContactSection key="contacts" />,
  }

  // Filter out sections with order 0
  const visibleSections = Object.entries(data.sectionOrder).filter(([, order]) => order > 0)

  // Sort them by order
  const orderedSections = visibleSections
    .sort(([, a], [, b]) => a - b)
    .map(([sectionName]) => sectionComponents[sectionName as keyof typeof sectionComponents])

  const sectionNames = visibleSections
    .sort(([, a], [, b]) => a - b)
    .map(([sectionName]) => sectionName)

  return (
    <div className="min-h-screen text-foreground">
      <ParticleBackground />
      <Nav sections={sectionNames} />
      <main className="mx-2 sm:mx-auto px-2 lg:px-10">
        {orderedSections.map((section, index) => (
          <section key={index} id={sectionNames[index]} className="scroll-mt-16">
            {section}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  )
}
