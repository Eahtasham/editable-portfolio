"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, ArrowUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area" 

interface ChatMessage {
  role: "user" | "bot"
  content: string
}

export const FloatingActions = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", content: "Hello! How can I help you today?" },
  ])
  const [inputMessage, setInputMessage] = useState("")
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

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return

    const newUserMessage: ChatMessage = { role: "user", content: inputMessage.trim() }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInputMessage("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        role: "bot",
        content: `Thanks for your message! You said: "${newUserMessage.content}". I'm a demo bot, but I'll pass this along!`,
      }
      setMessages((prevMessages) => [...prevMessages, botResponse])
    }, 1000) // Simulate a 1-second delay for bot response
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
            className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Open chatbot"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/50 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Chat with me!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-grow p-4 border rounded-md bg-background/50 mb-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] p-2 rounded-lg ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Scroll target */}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage()
                }}
                className="flex-grow bg-background/50 border-border"
              />
              <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
