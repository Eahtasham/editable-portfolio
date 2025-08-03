"use client";

import { Button } from "@/components/ui/button";
import { Download, Github, MapPin } from "lucide-react";
import Image from "next/image";
import React from "react";
import { FlipWords } from "@/components/external-ui/flip-words";
import { getDeviconUrl } from "@/lib/portfolio-api";
import { usePortfolio } from "@/context/PortfolioContext";
import { BoxReveal } from "../box-reveal";

const isPlaceholder = (url: string) => /placeholder/i.test(url);

const GradientText = ({ children, className = "" }: any) => (
  <span
    className={`bg-gradient-primary bg-clip-text text-transparent font-bold ${className}`}
    style={{
      backgroundSize: "200% 100%",
      animation: "gradient-shift 4s ease-in-out infinite",
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
    <section className="relative sm:min-h-screen flex items-center justify-center pt-20 sm:pt-4 overflow-hidden">
      <div className="relative container mx-auto px-0 lg:px-6 py-2">
        {showImage ? (
          // --- Grid layout when image is present ---
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-16 items-center min-h-[80vh]">
            {/* Left: Text */}
            <HeroContent hero={hero} />

            {/* Right: Profile Image */}
            <div className="relative justify-center lg:justify-end order-1 lg:order-2 hidden lg:block lg:pl-20">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-30"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, transparent 70%)",
                    transform: "scale(1.2)",
                  }}
                />
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

                {/* Floating balls */}
                <div className="absolute -top-6 -right-6 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse opacity-80" />
                <div className="absolute -bottom-8 -left-8 w-6 h-6 bg-gradient-to-br from-accent to-primary rounded-full animate-pulse delay-1000 opacity-80" />
                <div className="absolute top-1/4 -left-8 w-4 h-4 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse delay-500 opacity-80" />
              </div>
            </div>
          </div>
        ) : (
          // --- Centered layout when image is absent ---
          <div className="flex flex-col justify-center items-center text-center min-h-[90vh] max-w-3xl mx-auto space-y-8">
            <HeroContent hero={hero} centered />
          </div>
        )}
      </div>

      {/* Floating background orbs */}
      {/* <div className="absolute top-1/4 left-10 w-4 h-4 bg-primary/20 rounded-full animate-pulse" /> */}
      <div className="absolute bottom-1/4 right-10 w-3 h-3 bg-accent/20 rounded-full animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-pulse delay-1000" />
    </section>
  );
};

const HeroContent = ({ hero, centered = false }: { hero: any; centered?: boolean }) => (
  <div className={`space-y-8 ${centered ? "text-center items-center" : ""}`}>
    {/* Headings */}
    <div className="space-y-6">
      <BoxReveal duration={0.5}>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
          {hero.greeting}
        </h1>
      </BoxReveal>
      <h1 className="text-5xl xl:text-6xl text-primary font-extrabold leading-tight tracking-tight">
        {/* <GradientText>{hero.heading}</GradientText> */}
        <BoxReveal duration={0.5}>
          {hero.heading}
        </BoxReveal>
      </h1>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed">
      <BoxReveal duration={0.5}>

          {hero.subheading}
      </BoxReveal>

        </h2>
    </div>

    {/* Flip Highlights */}
    {hero.highlights?.length > 0 && (
      <BoxReveal duration={0.5}>

        <h3 className="text-xl font-semibold text-foreground/90">
          Expertise in:{" "}
          <FlipWords
            words={hero.highlights}
            duration={1500}
            className="bg-gradient-to-r from-primary to-accent bg-clip-text text-primary text-xl font-semibold"
          />
        </h3>
      </BoxReveal>
    )}


    {/* Buttons */}
    <div className={`flex flex-col sm:flex-row gap-4 ${centered ? "justify-center" : ""}`}>
      <Button
        size="lg"
        className="px-8 py-4 bg-primary hover:bg-primary/80 shadow-lg hover:shadow-xl text-lg"
      >
        {hero.cta}
      </Button>
      {hero.downloadCV && (
        <Button
          variant="outline"
          size="lg"
          asChild
          className="px-8 py-4 border-2 hover:bg-muted/50 text-lg"
        >
          <a href={hero.downloadCV} download className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download CV
          </a>
        </Button>
      )}
    </div>

    {/* Social Links */}
    {hero.socialLinks?.length > 0 && (
      <div className={`flex gap-3 flex-wrap ${centered ? "justify-center" : ""}`}>
        {hero.socialLinks.map((link: any, index: number) => (
          <button
            key={link.name}
            onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
            className="group relative p-2 rounded-xl border border-border/50 bg-background/80 backdrop-blur-md transition-all duration-500 ease-out hover:bg-accent/20 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20"
            style={{ animationDelay: `${index * 100}ms` }}
            aria-label={`Visit ${link.name} profile`}
            title={`Connect on ${link.name}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex items-center justify-center w-8 h-8 group-hover:scale-130 group-hover:rotate-3 transition-transform duration-300 ease-out">
              {link.name.toLowerCase() === "github" ? (
                <Github className="w-7 h-7 text-black dark:text-white transition-colors duration-300" />
              ) : (
                <Image
                  src={getDeviconUrl(link.name)}
                  width={28}
                  height={28}
                  alt={`${link.name} icon`}
                  className="object-contain brightness-110 group-hover:brightness-100 group-hover:drop-shadow-sm transition-all duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const container = target.parentElement;
                    target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className =
                      "text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300";
                    fallback.textContent = link.name.charAt(0).toUpperCase();
                    container?.appendChild(fallback);
                  }}
                />
              )}
            </div>

            <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/30 group-hover:animate-pulse transition-all duration-300" />

            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover border border-border rounded-md text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-md">
              {link.name}
            </span>
          </button>
        ))}
      </div>
    )}

    {/* Location */}
    {hero.location && (
      <div className={`flex items-center gap-2 text-muted-foreground ${centered ? "justify-center" : ""}`}>
        <MapPin className="h-5 w-5" />
        <span className="text-base">{hero.location}</span>
      </div>
    )}
  </div>
);
