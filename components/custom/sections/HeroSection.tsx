"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PortfolioData, usePortfolio } from "@/context/PortfolioContext";
import { LucideGithub, LucideLinkedin, MapPin, Download } from "lucide-react";
import Image from "next/image";
import React from "react";
import { FlipWords } from "@/components/external-ui/flip-words";

// Helper function to check placeholder by presence of placeholder word in URL
const isPlaceholder = (url: string) => /placeholder/i.test(url);

function getDeviconUrl(techName: any) {
  const formattedName = techName.toLowerCase().replace(/[^a-z]/g, '');
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${formattedName}/${formattedName}-original.svg`;
}



const GradientText = ({ children, className = "" }: any) => (
  <span
    className={`bg-gradient-primary bg-clip-text text-transparent font-bold ${className}`}
    style={{
      backgroundSize: '200% 100%',
      animation: 'gradient-shift 4s ease-in-out infinite'
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
  const { data } = usePortfolio();
  const hero = data.hero;
  const showImage = !isPlaceholder(hero.image);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
      {/* Background with subtle pattern */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      /> */}

      <div className="relative container mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">

          {/* Left: Content */}
          <div className="space-y-8 order-2 lg:order-1">

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">{hero.greeting}</h1>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight">
                <GradientText>{hero.heading}</GradientText>
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-muted-foreground leading-relaxed">
                {hero.subheading}
              </h2>
            </div>

            {/* Tagline */}
            {/* <p className="text-lg sm:text-2xl text-foreground/80 leading-relaxed max-w-2xl">
              {hero.tagline}
            </p> */}

            {/* Highlights with FlipWords Effect */}
            {hero.highlights && hero.highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-foreground/90">Expertise in: <span className="">
                  <FlipWords
                    words={hero.highlights}
                    duration={1500}
                    className="bg-gradient-to-r from-primary to-accent bg-clip-text text-primary text-2xl font-semibold"
                  />
                </span></h3>

              </div>
            )}

            {/* Skills */}
            {/* {hero.skills && hero.skills.length > 0 && (
              <div className="">
                <div className="flex flex-wrap gap-3">
                  {hero.skills.map((skill, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-full bg-gradient-to-r from-background/80 via-card/90 to-background/80 border border-border/50 hover:border-primary/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative px-4 py-2.5 flex items-center gap-2">
                        <img
                          src={getDeviconUrl(skill)}
                          alt={`${skill} icon`}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-sm font-medium text-foreground/90 group-hover:text-primary/90 transition-colors duration-300">
                          {skill}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                {hero.cta}
              </Button>
              {hero.downloadCV && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="px-8 py-4 border-2 hover:bg-muted/50 transition-all duration-300 text-lg"
                >
                  <a href={hero.downloadCV} download className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download CV
                  </a>
                </Button>
              )}
            </div>

            {/* Social Links */}
            {hero.socialLinks && hero.socialLinks.length > 0 && (
              <div className="flex gap-3 flex-wrap items-center">
                {hero.socialLinks.map((link, index) => (
                  <button
                    key={link.name}
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                    className="group relative p-2 rounded-xl border border-border/50 bg-background/80 backdrop-blur-md transition-all duration-500 ease-out hover:bg-accent/20 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background active:scale-95 overflow-hidden"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                    aria-label={`Visit ${link.name} profile`}
                    title={`Connect on ${link.name}`}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon container with hover effects */}
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 group-hover:scale-130 group-hover:rotate-3 transition-transform duration-300 ease-out">
                      <Image
                        src={getDeviconUrl(link.name)}
                        width={28}
                        height={28}
                        alt={`${link.name} icon`}
                        className="object-contain filter brightness-75 group-hover:brightness-100 group-hover:drop-shadow-sm transition-all duration-300"
                        onError={(e) => {
                          // Fallback to text icon if image fails
                          const target = e.currentTarget;
                          const container = target.parentElement;
                          target.style.display = 'none';

                          const fallback = document.createElement('div');
                          fallback.className = 'text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300';
                          fallback.textContent = link.name.charAt(0).toUpperCase();
                          container?.appendChild(fallback);
                        }}
                      />
                    </div>

                    {/* Subtle pulse effect on hover */}
                    <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/30 group-hover:animate-pulse transition-all duration-300" />

                    {/* Tooltip-like label that appears on hover */}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover border border-border rounded-md text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-md">
                      {link.name}
                    </span>
                  </button>
                ))}
              </div>
            )}



            {/* Stats */}
            {/* {hero.stats && hero.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
            )} */}

            {/* Location */}
            {hero.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-base">{hero.location}</span>
              </div>
            )}

          </div>

          {/* Right: Profile Image - Hidden on mobile */}
          {showImage && (
            <div className="relative justify-center lg:justify-end order-1 lg:order-2 hidden lg:block lg:pl-20">
              <div className="relative">

                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-30"
                  style={{
                    background: 'radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, transparent 70%)',
                    transform: 'scale(1.2)'
                  }}
                />

                {/* Profile image container - Bigger and positioned higher */}
                <div className="relative w-[28rem] h-[28rem] xl:w-96 xl:h-96 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-2 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={hero.image}
                      alt="Profile"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      priority
                    />
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse opacity-80" />
                <div className="absolute -bottom-8 -left-8 w-6 h-6 bg-gradient-to-br from-accent to-primary rounded-full animate-pulse delay-1000 opacity-80" />
                <div className="absolute top-1/4 -left-8 w-4 h-4 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse delay-500 opacity-80" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating background elements */}
      <div className="absolute top-1/4 left-10 w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-3 h-3 bg-accent/20 rounded-full animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-pulse delay-1000" />
    </section>
  );
};
