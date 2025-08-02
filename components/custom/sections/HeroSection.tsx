"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PortfolioData, usePortfolio } from "@/context/PortfolioContext";
import { LucideGithub, LucideLinkedin, MapPin, Download } from "lucide-react";
import Image from "next/image";
import React from "react";

// Helper function to check placeholder by presence of placeholder word in URL
const isPlaceholder = (url: string) =>
  /placeholder/i.test(url);

const AnimatedWave = () => (
  <svg
    viewBox="0 0 200 200"
    width={220}
    height={220}
    className="absolute inset-0 pointer-events-none"
    style={{ zIndex: 1 }}
  >
    <defs>
      <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <circle
      cx="100"
      cy="100"
      r="95"
      fill="none"
      stroke="url(#wave-gradient)"
      strokeWidth="3"
      strokeDasharray="20 15"
      style={{
        strokeLinecap: "round",
        strokeDashoffset: 0,
        animation: "wave-rotation 8s linear infinite",
      }}
    />
    <circle
      cx="100"
      cy="100"
      r="85"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="1"
      strokeDasharray="8 12"
      style={{
        strokeLinecap: "round",
        strokeDashoffset: 0,
        animation: "wave-rotation 12s linear infinite reverse",
        opacity: 0.4,
      }}
    />
    <style>{`
      @keyframes wave-rotation {
        to { stroke-dashoffset: -70; }
      }
    `}</style>
  </svg>
);

const GradientText = ({ children, className = "" }:any) => (
  <span 
    className={`bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-bold ${className}`}
    style={{
      backgroundSize: '200% 100%',
      animation: 'gradient-shift 3s ease-in-out infinite'
    }}
  >
    {children}
    <style>{`
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    `}</style>
  </span>
);

export const HeroSection = () => {
  const {data} = usePortfolio();
  const hero=data.hero;
  const showImage = !isPlaceholder(hero.image);

  return (
    <section className="min-h-screen flex items-center justify-center gradient-hero pt-14">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative container mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen py-8 lg:py-12 gap-8 lg:gap-16">
          
          {/* Left: Content */}
          <div className={`flex-1 space-y-6 ${showImage ? 'text-left' : 'text-center'} max-w-2xl`}>
            
            {/* Greeting */}
            {/* <div className="space-y-2">
              <Badge variant="outline" className="text-xs font-medium tracking-wider uppercase px-4 py-1.5 border-primary/20 bg-primary/5">
                {hero.greeting}
              </Badge>
            </div> */}

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                <GradientText>{hero.heading}</GradientText>
              </h1>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-muted-foreground leading-relaxed">
                {hero.subheading}
              </h2>
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed max-w-xl">
              {hero.tagline}
            </p>

            {/* Highlights */}
            {hero.highlights && hero.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hero.highlights.map((highlight, i) => (
                  <Badge 
                    key={i} 
                    className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-foreground hover:from-primary/20 hover:to-accent/20 transition-all duration-300"
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>
            )}

            {/* Skills */}
            {hero.skills && hero.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hero.skills.map((skill, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary"
                    className="px-3 py-1.5 bg-muted/50 hover:bg-muted transition-colors duration-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            {hero.stats && hero.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
                {hero.stats.map((stat) => (
                  <Card key={stat.label} className="p-4 text-center bg-card/50 border-border/50 hover:bg-card/80 transition-colors duration-300">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Location */}
            {hero.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{hero.location}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                size="lg" 
                className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {hero.cta}
              </Button>
              {hero.downloadCV && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="px-8 py-3 border-2 hover:bg-muted/50 transition-all duration-300"
                >
                  <a href={hero.downloadCV} download className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download CV
                  </a>
                </Button>
              )}
            </div>

            {/* Social Links */}
            {hero.socialLinks && hero.socialLinks.length > 0 && (
              <div className="flex gap-4 pt-4">
                {hero.socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                    aria-label={link.name}
                  >
                    <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                      {link.icon}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right: Profile Image */}
          {showImage && (
            <div className="relative flex-shrink-0">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72">
                
                {/* Animated border */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatedWave />
                </div>

                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full blur-3xl opacity-20"
                  style={{
                    background: 'radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, transparent 70%)',
                    transform: 'scale(0.8)'
                  }}
                />

                {/* Profile image container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-1 shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      <Image
                        src={hero.image}
                        alt="Profile"
                        width={320}
                        height={320}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse" />
                <div className="absolute -bottom-8 -left-8 w-4 h-4 bg-gradient-to-br from-accent to-primary rounded-full animate-pulse delay-1000" />
                <div className="absolute top-1/4 -left-6 w-3 h-3 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse delay-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};