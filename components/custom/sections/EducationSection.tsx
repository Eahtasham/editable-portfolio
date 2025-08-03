"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Calendar, MapPin, Award, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available
import { usePortfolio } from "@/context/PortfolioContext"


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

export const EducationSection = () => {
  const { data } = usePortfolio();
  const education = data.education;

  return (
    <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground">Education</h2>
      <motion.div
        className="relative space-y-12" // Changed to space-y for vertical stacking
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Central vertical line for desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-primary hidden md:block" />

        {education.map((edu, index) => (
          <motion.div
            key={edu.id}
            variants={itemVariants}
            className={cn(
              "relative w-full flex items-center", // Each item takes full width, uses flex for positioning
              index % 2 === 0 ? "md:justify-start" : "md:justify-end", // Desktop: push card to left/right
            )}
          >
            {/* Timeline Dot */}
            <div
              className={cn(
                "absolute size-4 rounded-full bg-primary z-10",
                "left-0 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2", // Mobile left, Desktop center
              )}
            />

            {/* Card */}
            <Card
              className={cn(
                "w-full bg-card border-border/50 backdrop-blur-sm",
                "ml-6 md:ml-0", // Mobile: ml-6 to push card right from dot. Desktop: no ml.
                "md:w-[calc(50%-2rem)]", // Take half width minus gap (2rem = 32px for md:ml-8/mr-8)
                index % 2 === 0 ? "md:mr-8" : "md:ml-8", // Desktop: Add margin to create gap from center line
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  {edu.logo && (
                    <img
                      src={edu.logo || "/placeholder.svg"}
                      alt={`${edu.institution} logo`}
                      className="size-10 object-contain rounded-full"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                      {edu.institution}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{edu.degree}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{edu.year}</span>
                  {edu.location && (
                    <>
                      <span className="mx-1">•</span>
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{edu.location}</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                {(edu.major || edu.gpa) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                    {edu.major && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>Major: {edu.major}</span>
                      </div>
                    )}
                    {edu.gpa && (
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>GPA: {edu.gpa}</span>
                      </div>
                    )}
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

export default EducationSection
