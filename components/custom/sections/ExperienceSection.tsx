"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Code, 
  CheckCircle, 
  Target, 
  Clock
} from "lucide-react"
import { usePortfolio } from "@/context/PortfolioContext"
import { AnimatedTooltip } from "../animated-tooltip"
import Image from "next/image"

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

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {experience.map((exp) => (
          <motion.div key={exp.id} variants={itemVariants}>
            <Card className="h-full flex flex-col bg-card border-border/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-border">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {exp.companyLogo && (
                      <div className="flex-shrink-0">
                        <Image
                          src={exp.companyLogo}
                          alt={`${exp.company} logo`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-contain bg-background p-1 border border-border/50"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div>
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
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {exp.current && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/20 flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Current
                      </Badge>
                    )}
                    {exp.type && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{exp.role}</span>
                </div>
                
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
              </CardHeader>
              
              <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exp.description}
                </p>
                
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Key Responsibilities:
                    </h4>
                    <motion.ul 
                      className="space-y-1"
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {exp.responsibilities.map((responsibility, index) => (
                        <motion.li
                          key={index}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                          variants={listItemVariants}
                        >
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{responsibility}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Key Achievements:
                    </h4>
                    <motion.ul 
                      className="space-y-1"
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {exp.achievements.map((achievement, index) => (
                        <motion.li
                          key={index}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                          variants={listItemVariants}
                        >
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{achievement}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}
                
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
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