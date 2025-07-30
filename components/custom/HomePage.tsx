"use client"

import { usePortfolio } from "@/context/PortfolioContext"
import { HeroSection } from "./sections/HeroSection"
import { AboutSection } from "./sections/AboutSection"
import { ProjectSection } from "./sections/ProjectSection"
import { ExperienceSection } from "./sections/ExperienceSection"
import { EducationSection } from "./sections/EducationSection"
import { SkillsSection } from "./sections/SkillsSection"
import { ContactSection } from "./sections/ContactSection"


export default function HomePage() {
  const { data,loading } = usePortfolio()

  if (loading) {
    return <div>Loading...</div>
  }

  // Create ordered sections based on sectionOrder
  const sectionComponents = {
    hero: <HeroSection key="hero" hero={data.hero} />,
    about: <AboutSection key="about" about={data.about} />,
    projects: <ProjectSection key="projects" projects={data.projects} />,
    experience: <ExperienceSection key="experience" experience={data.experience} />,
    education: <EducationSection key="education" education={data.education} />,
    skills: <SkillsSection key="skills" skills={data.skills} />,
    contacts: <ContactSection key="contacts" contacts={data.contacts} />,
  }

  // Sort sections by order and add skills section
  const orderedSections = Object.entries({ ...data.sectionOrder, skills: 5.5 })
    .sort(([, a]:any, [, b]:any) => a - b)
    .map(([sectionName]) => sectionComponents[sectionName as keyof typeof sectionComponents])

  const sectionNames = Object.keys({ ...data.sectionOrder, skills: 5.5 }).sort(
    (a, b) =>
      (({ ...data.sectionOrder, skills: 5.5 })[a] as number) - ({ ...data.sectionOrder, skills: 5.5 }[b] as number),
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <Navigation sections={sectionNames} /> */}
      <div>
        {orderedSections.map((section, index) => (
          <div key={index} id={sectionNames[index]}>
            {section}
          </div>
        ))}
      </div>
      {/* <Footer /> */}
    </div>
  )
}
