"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  Code,
  Server,
  PenToolIcon as Tool,
  Database,
  Cloud,
  Smartphone,
  Palette,
  TestTube,
  GitBranch,
  Languages,
  Layers,
} from "lucide-react"
import { TechIcon } from "../tech-icon"
import { usePortfolio } from "@/context/PortfolioContext"


const categoryIcons: { [key: string]: React.ElementType } = {
  frontend: Code,
  backend: Server,
  tools: Tool,
  databases: Database,
  cloud: Cloud,
  mobile: Smartphone,
  design: Palette,
  testing: TestTube,
  devops: GitBranch,
  languages: Languages,
  frameworks: Layers,
}

const proficiencyColors = {
  beginner: "bg-muted text-muted-foreground",
  intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  expert: "bg-green-500/20 text-green-400 border-green-500/30",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export const SkillsSection = () => {
  const {data} =usePortfolio();
  const skills=data.skills;

  const renderSkillCategory = (title: string, skillsArray: string[] | undefined, IconComponent: React.ElementType) => {
    if (!skillsArray || skillsArray.length === 0) return null
    return (
      <motion.div variants={itemVariants}>
        <Card className="h-full bg-card border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground">
              <IconComponent className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {skillsArray.map((skill) => (
              <Badge key={skill} variant="outline" className="text-sm px-3 py-1.5 flex items-center gap-2">
                <TechIcon techName={skill} size={16} className="h-4 w-4" />
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground">Skills</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {renderSkillCategory("Frontend", skills.frontend, categoryIcons.frontend)}
        {renderSkillCategory("Backend", skills.backend, categoryIcons.backend)}
        {renderSkillCategory("Tools", skills.tools, categoryIcons.tools)}
        {renderSkillCategory("Databases", skills.databases, categoryIcons.databases)}
        {renderSkillCategory("Cloud Platforms", skills.cloud, categoryIcons.cloud)}
        {renderSkillCategory("Mobile Development", skills.mobile, categoryIcons.mobile)}
        {renderSkillCategory("Design Tools", skills.design, categoryIcons.design)}
        {renderSkillCategory("Testing", skills.testing, categoryIcons.testing)}
        {renderSkillCategory("DevOps", skills.devops, categoryIcons.devops)}

        {/* Languages with Proficiency */}
        {skills.languages && skills.languages.length > 0 && (
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full bg-card border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground">
                  <Languages className="h-5 w-5 text-primary" />
                  Programming Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {skills.languages.map((lang) => (
                  <div key={lang.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TechIcon techName={lang.name} size={20} className="h-5 w-5" />
                      <span className="font-medium text-foreground">{lang.name}</span>
                    </div>
                    <Badge className={`text-xs px-2.5 py-1 rounded-full ${proficiencyColors[lang.proficiency]}`}>
                      {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                      {lang.yearsOfExperience && ` (${lang.yearsOfExperience} yrs)`}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Frameworks with Proficiency */}
        {skills.frameworks && skills.frameworks.length > 0 && (
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full bg-card border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground">
                  <Layers className="h-5 w-5 text-primary" />
                  Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {skills.frameworks.map((framework) => (
                  <div key={framework.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TechIcon techName={framework.name} size={20} className="h-5 w-5" />
                      <span className="font-medium text-foreground">{framework.name}</span>
                    </div>
                    <Badge className={`text-xs px-2.5 py-1 rounded-full ${proficiencyColors[framework.proficiency]}`}>
                      {framework.proficiency.charAt(0).toUpperCase() + framework.proficiency.slice(1)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SkillsSection
