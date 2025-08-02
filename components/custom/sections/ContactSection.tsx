"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Mail, Twitter, Github, Linkedin, MessageSquare, Send, Copy } from "lucide-react" // Added Copy icon
import { useState, useTransition } from "react"
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

export const ContactSection = () => {
  const {data}= usePortfolio();
  const contacts = data.contacts;
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [copied, setCopied] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(() => {
      console.log("Form Data Submitted:", formData)
      setFormData({ name: "", email: "", message: "" })
      alert("Message sent! (Check console for data)")
    })
  }

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000) // Reset copied state after 2 seconds
    })
  }

  const contactLinks = [
    {
      name: "Email",
      icon: Mail,
      value: contacts.email,
      type: "copy",
      action: () => handleCopyToClipboard(contacts.email, "email"),
      visible: !!contacts.email,
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: contacts.twitter ? `https://twitter.com/${contacts.twitter}` : undefined,
      value: contacts.twitter,
      type: "link",
      visible: !!contacts.twitter,
    },
    {
      name: "GitHub",
      icon: Github,
      href: contacts.github ? `https://github.com/${contacts.github}` : undefined,
      value: contacts.github,
      type: "link",
      visible: !!contacts.github,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: contacts.linkedin ? `https://www.linkedin.com/in/${contacts.linkedin}` : undefined,
      value: contacts.linkedin,
      type: "link",
      visible: !!contacts.linkedin,
    },
    {
      name: "Discord",
      icon: MessageSquare,
      value: contacts.discord,
      type: "copy",
      action: () => handleCopyToClipboard(contacts.discord || "", "discord"),
      visible: !!contacts.discord,
    },
    {
      name: "Telegram",
      icon: Send,
      href: contacts.telegram ? `https://t.me/${contacts.telegram}` : undefined,
      value: contacts.telegram,
      type: "link",
      visible: !!contacts.telegram,
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground">Contact Me</h2>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Section: Consolidated Contact Links */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-card border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-semibold text-foreground">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactLinks.map(
                (link) =>
                  link.visible && (
                    <div key={link.name} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <link.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-foreground">{link.name}</h3>
                        <p className="text-sm text-muted-foreground break-all">{link.value}</p>
                      </div>
                      {link.type === "link" && link.href && (
                        <Button asChild variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            Visit
                          </a>
                        </Button>
                      )}
                      {link.type === "copy" && link.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={link.action}
                          className="flex-shrink-0 bg-transparent"
                        >
                          {copied === link.name.toLowerCase() ? (
                            <>
                              <Copy className="h-4 w-4 mr-2" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" /> Copy
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ),
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Section: Contact Form */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-card border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-semibold text-foreground">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your message..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ContactSection
