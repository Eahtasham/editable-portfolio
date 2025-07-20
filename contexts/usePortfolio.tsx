"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

// Updated interface to match the actual JSON structure
export interface PortfolioData {
  theme: {
    styles: {
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    currentMode: "light" | "dark";
  };
  hero: {
    heading: string;
    subheading: string;
    cta: string;
    image: string;
  };
  about: { 
    markdown: string; 
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    tech: string[];
    link?: string;
    github?: string;
    image: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    year: string;
    description: string;
  }>;
  skills: {
    frontend: string[];
    backend: string[];
    tools: string[];
  };
  contacts: {
    email: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

interface PortfolioContextType {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  updateData: (newData: Partial<PortfolioData>) => Promise<void>;
  refreshData: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Make sure these are prefixed with NEXT_PUBLIC in .env
const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID ?? "";
const API_KEY = "$2a$10$kmpv8tBl6D2fT78OSLbNueGY3Y8xGUMDwAiaNvGcgesef00npPyaK";

const defaultData: PortfolioData = {
  theme: {
    styles: {
      light: {
        background: "oklch(100% 0 0)",
        foreground: "oklch(9% 0.026 285.75)",
        primary: "oklch(56.27% 0.194 12.57)",
        "primary-foreground": "oklch(98% 0.013 285.75)",
        secondary: "oklch(96% 0.013 285.75)",
        "secondary-foreground": "oklch(11.2% 0.026 285.75)",
        accent: "oklch(96% 0.013 285.75)",
        "accent-foreground": "oklch(11.2% 0.026 285.75)",
        muted: "oklch(96% 0.013 285.75)",
        "muted-foreground": "oklch(46.9% 0.009 285.75)",
        card: "oklch(100% 0 0)",
        "card-foreground": "oklch(9% 0.026 285.75)",
        destructive: "oklch(60.2% 0.199 29.23)",
        "destructive-foreground": "oklch(98% 0.013 285.75)",
        border: "oklch(91.4% 0.008 285.75)",
        input: "oklch(91.4% 0.008 285.75)",
        ring: "oklch(9% 0.026 285.75)",
      },
      dark: {
        background: "oklch(9% 0.026 285.75)",
        foreground: "oklch(98% 0.013 285.75)",
        primary: "oklch(98% 0.013 285.75)",
        "primary-foreground": "oklch(11.2% 0.026 285.75)",
        secondary: "oklch(17.5% 0.015 285.75)",
        "secondary-foreground": "oklch(98% 0.013 285.75)",
        accent: "oklch(17.5% 0.015 285.75)",
        "accent-foreground": "oklch(98% 0.013 285.75)",
        muted: "oklch(17.5% 0.015 285.75)",
        "muted-foreground": "oklch(65.1% 0.011 285.75)",
        card: "oklch(9% 0.026 285.75)",
        "card-foreground": "oklch(98% 0.013 285.75)",
        destructive: "oklch(30.6% 0.124 29.23)",
        "destructive-foreground": "oklch(98% 0.013 285.75)",
        border: "oklch(17.5% 0.015 285.75)",
        input: "oklch(17.5% 0.015 285.75)",
        ring: "oklch(83.9% 0.016 285.75)",
      },
    },
    currentMode: "dark",
  },
  hero: {
    heading: "Hi, I'm Eahtasham",
    subheading: "Full Stack Developer & UI/UX Designer",
    cta: "Contact Me",
    image: "/placeholder.svg?height=400&width=400",
  },
  about: {
    markdown: "# About Me\n\nI'm a passionate full-stack developer with 5+ years of experience building modern web applications. I love creating beautiful, functional, and user-friendly digital experiences.",
  },
  projects: [
    {
      id: "1",
      title: "E-commerce Platform",
      description: "A modern e-commerce platform built with Next.js and Stripe",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe"],
      link: "https://example.com",
      github: "https://github.com/example",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  experience: [
    {
      id: "1",
      company: "Tech Corp",
      role: "Senior Frontend Developer",
      year: "2022 - Present",
      description: "Leading frontend development for multiple client projects",
    },
  ],
  skills: {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    backend: ["Node.js", "Express", "PostgreSQL", "MongoDB"],
    tools: ["Git", "Docker", "AWS", "Figma"],
  },
  contacts: {
    email: "john@example.com",
    twitter: "https://twitter.com/johndoe",
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
  },
};

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchData = async (): Promise<PortfolioData> => {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { "X-Master-Key": API_KEY },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const result = await res.json();
      console.log("Fetched data:", result);
      return result.record || defaultData;
    } catch (err) {
      console.error("Fetch error:", err);
      return defaultData;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchData();
      setData(fetched);
      applyTheme(fetched.theme);
    } catch (e) {
      setError("Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData: Partial<PortfolioData>) => {
    if (!data) return;
    
    // Deep merge for nested objects like theme
    const updated: PortfolioData = {
      ...data,
      ...newData,
      // Handle theme updates properly
      ...(newData.theme && {
        theme: {
          ...data.theme,
          ...newData.theme,
          styles: {
            ...data.theme.styles,
            ...newData.theme.styles,
          },
        },
      }),
    };

    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify(updated),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} ${errorText}`);
      }
      
      setData(updated);
      if (newData.theme) applyTheme(updated.theme);
      toast.success("Portfolio updated successfully!");
    } catch (err) {
      toast.error("Failed to update portfolio");
      console.error("Update error:", err);
    }
  };

const applyTheme = (theme: PortfolioData["theme"]) => {
  if (typeof window === "undefined") return;
  
  const root = document.documentElement;
  const modeStyles = theme.styles[theme.currentMode];
  
  console.log(`Applying ${theme.currentMode} theme`);
  
  try {
    // Apply CSS custom properties
    Object.entries(modeStyles).forEach(([key, val]) => {
      // Ensure the OKLCH value is properly formatted
      const cleanValue = val.trim();
      root.style.setProperty(`--${key}`, cleanValue);
    });
    
    // Toggle dark class
    root.classList.toggle("dark", theme.currentMode === "dark");
    
    // Force a repaint
    root.style.display = 'none';
    root.offsetHeight; // Trigger reflow
    root.style.display = '';
    
    console.log("Theme applied successfully");
    
  } catch (error) {
    console.error("Error applying theme:", error);
    
    // Fallback: just toggle the dark class and let CSS handle it
    root.classList.toggle("dark", theme.currentMode === "dark");
  }
};

  const login = async (email: string, password: string): Promise<boolean> => {
    const adminEmail = "admin@portfolio.com";
    const adminPassword = "admin123";
    
    if (email === adminEmail && password === adminPassword) {
      setIsAuthenticated(true);
      // Note: localStorage usage removed for compatibility
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Note: localStorage usage removed for compatibility
  };

  useEffect(() => {
    // Note: localStorage check removed for compatibility
    refreshData();
  }, []);

  return (
    <PortfolioContext.Provider
      value={{ 
        data, 
        loading, 
        error, 
        updateData, 
        refreshData, 
        isAuthenticated, 
        login, 
        logout 
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolio must be used within PortfolioProvider");
  }
  return ctx;
};