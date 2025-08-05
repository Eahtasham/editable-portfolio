"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Briefcase, Calendar, MapPin, ExternalLink, Code } from "lucide-react"
import { usePortfolio } from "@/context/PortfolioContext"
import { AnimatedTooltip } from "../animated-tooltip"

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

export const ExperienceSection = () => {
  const { data } = usePortfolio()
  const experience = data.experience;
  return (
    <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground">Experience</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {experience.map((exp) => (
          <motion.div key={exp.id} variants={itemVariants}>
            <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                    {exp.company}
                    {exp.companyWebsite && (
                      <a
                        href={exp.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:text-primary/80 transition-colors inline-flex items-center"
                        aria-label={`Visit ${exp.company} website`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardTitle>
                  {exp.type && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium">{exp.role}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{exp.year}</span>
                  {exp.location && (
                    <>
                      <span className="mx-1">•</span>
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{exp.location}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2 whitespace-nowrap">
                        <Code className="h-4 w-4 text-primary" />
                        Technologies:
                      </h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <AnimatedTooltip
                          items={exp.technologies.map((technology, index) => ({
                            id: index,
                            name: technology,
                            techName: technology,
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default ExperienceSection
