"use client"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Github, Link2, Code, Calendar, Tag, CheckCircle, User, ImageIcon, ExternalLink, PackageOpen, ChevronUpCircle } from "lucide-react"
import { usePortfolio } from "@/context/PortfolioContext"
import { AnimatedTooltip } from "../animated-tooltip"
import { ImageModal } from "../image-modal"
import { useState } from "react"


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
  const [selectedImage, setSelectedImage] = useState<{ image: string; link?: string; github?: string } | null>(null)

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
    <div className="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Featured Projects
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my latest work showcasing expertise in web development, design, and innovative solutions.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={itemVariants}>
              <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
                {/* Image Container - Removed top padding, starts with image */}
                <div
                  className="relative w-full h-48 sm:h-56 bg-muted flex items-center justify-center overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage({ image: project.image, link: project.link, github: project.github })}
                >
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:blur-sm"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="bg-primary/90 hover:bg-primary p-3 rounded-full transition-colors">
                        <ChevronUpCircle className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </motion.div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground line-clamp-2">
                      {project.title}
                    </CardTitle>
                    {project.status && getStatusBadge(project.status)}
                  </div>
                  {project.category && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Code className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{project.category}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-grow flex flex-col gap-4">
                  {/* Description */}
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </CardDescription>

                  {/* Technologies */}
                  {project.tech.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Code className="h-3.5 w-3.5 text-primary" />
                        Technologies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <AnimatedTooltip items={project.tech.map((technology, index) => ({
                          id: index,
                          name: technology,
                          techName: technology,
                        }))} />
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  {(project.year || project.role) && (
                    <div className="pt-2 border-t border-border/30">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                        {project.year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span>{project.year}</span>
                          </div>
                        )}
                        {project.role && (
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="truncate">{project.role}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {project.features && project.features.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs font-semibold text-foreground mb-2">Key Features:</p>
                      <ul className="space-y-1">
                        {project.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1 flex-shrink-0">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex gap-3 pt-4 mt-auto border-t border-border/30">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs sm:text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs sm:text-sm font-medium"
                      >
                        <Github className="h-4 w-4" />
                        <span className="hidden sm:inline">Code</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  )
}

export default ProjectSection
