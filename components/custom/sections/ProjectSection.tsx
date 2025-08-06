"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Github, Link2, Code, Calendar, Tag, CheckCircle, User } from "lucide-react"
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

export const ProjectSection = () => {
  const { data } = usePortfolio();
  const projects = data.projects

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge
            variant="default"
            className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
          >
            In Progress
          </Badge>
        )
      case "planned":
        return (
          <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
            Planned
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground">Projects</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {projects.map((project) => (
          <motion.div key={project.id} variants={itemVariants}>
            <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm overflow-hidden">
              <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" /> */}
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">{project.title}</CardTitle>
                  {project.status && getStatusBadge(project.status)}
                </div>
                {project.category && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Tag className="h-3 w-3 text-primary" />
                    <span>{project.category}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {project.description}
                </CardDescription>
                {project.tech.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2 whitespace-nowrap">
                        <Code className="h-4 w-4 text-primary" />
                        Technologies:
                      </h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <AnimatedTooltip
                          items={project.tech.map((tech, index) => ({
                            id: index,
                            name: tech,
                            techName: tech, // Pass skill as techName
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {(project.year || project.role) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                    {project.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{project.year}</span>
                      </div>
                    )}
                    {project.role && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-primary" />
                        <span>{project.role}</span>
                      </div>
                    )}
                  </div>
                )}
                {project.features && project.features.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Key Features:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {project.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                      <Link2 className="h-4 w-4" />
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default ProjectSection
