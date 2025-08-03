"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import {
  User,
  Globe,
  Languages,
  Heart,
  Briefcase,
  Trophy,
  Award,
  Calendar,
  ExternalLink,
  MapPin,
  Cake,
} from "lucide-react"

// Mock data for preview
const mockAbout = {
  markdown: `I'm a passionate full-stack developer with 5+ years of experience building modern web applications. I love creating beautiful, functional, and user-friendly digital experiences.`,
  personalInfo: {
    fullName: "Eahtasham Umm",
    age: 22,
    nationality: "Indian",
    languages: ["English", "Hindi", "Bengali", "Urdu"],
    hobbies: ["Coding", "Designing", "Chess"],
  },
  professionalSummary:
    "Creative and detail-oriented software engineer skilled in developing scalable and efficient web applications with a focus on user-centric design.",
  achievements: [
    {
      title: "Hackathon Winner",
      description: "Won first place in CodeSprint Hackathon 2023",
      year: "2023",
    },
  ],
  certifications: [
    {
      name: "Full Stack Web Development",
      issuer: "Udemy",
      year: "2022",
      credentialId: "ABC123",
      link: "https://udemy.com",
    },
  ],
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

export const AboutSection = () => {
  // In real implementation, this would come from usePortfolio()
  const about = mockAbout

  return (
    <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground">About</h2>
      <motion.div className="w-full space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-min">
          {/* Row 1: About Me Card with Hobbies & Languages - Left Side (2 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* <h3 className="text-sm sm:text-base font-medium text-foreground/90"># About Me</h3> */}
                  <p className="text-sm sm:text-sm text-muted-foreground leading-relaxed">{about.markdown}</p>
                </div>

                {/* Hobbies and Languages Section */}
                {(about.personalInfo?.hobbies || about.personalInfo?.languages) && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Hobbies */}
                      {about.personalInfo?.hobbies && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            <span className="text-sm sm:text-sm font-medium text-foreground">Hobbies</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {about.personalInfo.hobbies.map((hobby) => (
                              <Badge
                                key={hobby}
                                variant="outline"
                                className="text-sm px-2 py-1 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                              >
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {about.personalInfo?.languages && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Languages className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            <span className="text-sm sm:text-sm font-medium text-foreground">Languages</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {about.personalInfo.languages.map((lang) => (
                              <Badge
                                key={lang}
                                variant="secondary"
                                className="text-sm px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Row 1: Right Side - Personal Info and Professional (2 cards stacked) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Personal Info Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Personal Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {about.personalInfo && (
                    <div className="space-y-3">
                      <h3 className="text-sm sm:text-base font-medium text-foreground">
                        {about.personalInfo.fullName}
                      </h3>
                      {about.personalInfo.age && (
                        <div className="flex items-center gap-2 text-sm sm:text-sm text-muted-foreground">
                          <Cake className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{about.personalInfo.age} years old</span>
                        </div>
                      )}
                      {about.personalInfo.nationality && (
                        <div className="flex items-center gap-2 text-sm sm:text-sm text-muted-foreground">
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{about.personalInfo.nationality}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Summary Card */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Professional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-sm text-muted-foreground leading-relaxed">
                    {about.professionalSummary}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Row 2: Achievements Card - Left Half */}
          {about.achievements && (
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {about.achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        className="border-l-2 border-primary/30 pl-3 sm:pl-4 pb-1 sm:pb-4 last:pb-0"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-sm text-foreground truncate">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {achievement.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded shrink-0">
                            <Calendar className="h-3 w-3" />
                            <span>{achievement.year}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Row 2: Certifications Card - Right Half */}
          {about.certifications && (
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {about.certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm sm:text-sm text-foreground truncate">{cert.name}</h4>
                            {cert.link && (
                              <a
                                href={cert.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors shrink-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          {cert.credentialId && (
                            <p className="text-sm text-muted-foreground font-mono break-all">ID: {cert.credentialId}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-background/50 px-2 py-1 rounded shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span>{cert.year}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AboutSection
