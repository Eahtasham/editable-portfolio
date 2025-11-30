"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, ArrowUp, Bot, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePortfolio } from "@/context/PortfolioContext"

interface ChatMessage {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export const FloatingActions = () => {
  const { data } = usePortfolio();
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: `Hello! I'm ${data.hero.heading}'s AI assistant. I can help you learn more about their experience, projects, skills, and background. What would you like to know?`,
      timestamp: new Date()
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Create context from portfolio data
  const createPortfolioContext = () => {
    return `
    Portfolio Information for ${data.hero.heading}:
    
    PERSONAL INFO:
    - Name: ${data.hero.heading}
    - Role: ${data.hero.subheading}
    - Location: ${data.hero.location}
    - Tagline: ${data.hero.tagline}
    - Email: ${data.contacts.email}
    
    ABOUT:
    ${data.about.markdown}
    - Age: ${data.about.personalInfo?.age}
    - Nationality: ${data.about.personalInfo?.nationality}
    - Languages: ${data.about.personalInfo?.languages?.join(', ')}
    - Hobbies: ${data.about.personalInfo?.hobbies?.join(', ')}
    - Professional Summary: ${data.about.professionalSummary}
    
    EXPERIENCE:
    ${data.experience.map(exp => `
    - ${exp.role} at ${exp.company} (${exp.year})
      Location: ${exp.location}
      Type: ${exp.type}
      Current: ${exp.current ? 'Yes' : 'No'}
      Description: ${exp.description}
      Technologies: ${exp?.technologies?.join(', ')}
      Achievements: ${exp?.achievements?.join(', ')}
    `).join('\n')}
    
    PROJECTS:
    ${data.projects.map(project => `
    - ${project.title} (${project.year})
      Description: ${project.description}
      Technologies: ${project.tech.join(', ')}
      Category: ${project.category}
      Status: ${project.status}
      Role: ${project.role}
      Features: ${project.features?.join(', ')}
    `).join('\n')}
    
    EDUCATION:
    ${data.education.map(edu => `
    - ${edu.degree} from ${edu.institution} (${edu.year})
      Location: ${edu.location}
      GPA: ${edu.gpa}
      Description: ${edu.description}
    `).join('\n')}
    
    SKILLS:
    - Frontend: ${data.skills.frontend.join(', ')}
    - Backend: ${data.skills.backend.join(', ')}
    - Tools: ${data.skills.tools.join(', ')}
    - Databases: ${data.skills.databases?.join(', ')}
    - Cloud: ${data.skills.cloud?.join(', ')}
    - Mobile: ${data.skills.mobile?.join(', ')}
    - Design: ${data.skills.design?.join(', ')}
    - Testing: ${data.skills.testing?.join(', ')}
    - DevOps: ${data.skills.devops?.join(', ')}
    
    PROGRAMMING LANGUAGES:
    ${data.skills.languages?.map((lang: any) => `
    - ${lang.name}: ${lang.proficiency} level with ${lang.yearsOfExperience} years of experience
    `).join('\n')}
    
    ACHIEVEMENTS:
    ${data.about.achievements?.map((achievement: any) => `
    - ${achievement.title} (${achievement.year}): ${achievement.description}
    `).join('\n')}
    
    CERTIFICATIONS:
    ${data.about.certifications?.map((cert: any) => `
    - ${cert.name} from ${cert.issuer} (${cert.year})
    `).join('\n')}
    
    SOCIAL LINKS:
    - GitHub: ${data.contacts.github}
    - LinkedIn: ${data.contacts.linkedin}
    - Twitter: ${data.contacts.twitter}
    - Discord: ${data.contacts.discord}
    - Telegram: ${data.contacts.telegram}
    `
  }

  // Call API route instead of direct Gemini API
  const callChatAPI = async (userMessage: string) => {
    try {
      const portfolioContext = createPortfolioContext()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          portfolioContext: portfolioContext,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.')
        }
        throw new Error(data.error || 'Failed to get response')
      }

      return data.message
    } catch (error) {
      console.error('Error calling chat API:', error)
      if (error instanceof Error) {
        return error.message
      }
      return "I apologize, but I'm having trouble connecting right now. Please try again later."
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isLoading) return

    // Client-side validation
    if (inputMessage.length > 500) {
      const errorMessage: ChatMessage = {
        role: "bot",
        content: "Please keep your message under 500 characters.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const newUserMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const botResponse = await callChatAPI(newUserMessage.content)

      const newBotMessage: ChatMessage = {
        role: "bot",
        content: botResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, newBotMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "bot",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Back to top"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 relative"
            aria-label="Open chatbot"
          >
            <MessageSquare className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] bg-card border-border/50 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat with {data.about.personalInfo?.fullName}&apos; s AI Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-[500px]">
            {/* Messages Area - Fixed height with proper scrolling */}
            <div className="flex-1 min-h-0 mb-4">
              <ScrollArea className="h-full rounded-md border bg-background/50 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary" : "bg-muted"
                          }`}>
                          {msg.role === "user" ? (
                            <User className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div
                            className={`p-3 rounded-lg break-words ${msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                              }`}
                          >
                            <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          </div>
                          <span className={`text-xs text-muted-foreground/70 px-1 ${msg.role === "user" ? "text-right" : "text-left"
                            }`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading Animation */}
                  {isLoading && (
                    <div className="flex w-full justify-start">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                          <Bot className="h-4 w-4 text-muted-foreground animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="p-3 rounded-lg bg-muted rounded-bl-sm">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about experience, projects, skills..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-background/50 border-border"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={isLoading || inputMessage.trim() === ""}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground/70 mt-2 text-center">
                Powered by Google Gemini AI
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}