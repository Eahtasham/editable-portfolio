"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { updatePortfolioData, triggerRevalidation } from "../lib/portfolio-api";

export interface PortfolioData {
  theme: {
    styles: {
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    currentMode: "light" | "dark";
  };
  sectionOrder: {
    hero: number;
    about: number;
    projects: number;
    experience: number;
    skills: number;
    education: number;
    contacts: number;
  };
  hero: {
    heading: string;
    subheading: string;
    cta: string;
    image: string;
    greeting?: string;
    highlights?: string[];
    socialLinks?: Array<{
      name: string;
      url: string;
      icon: string;
    }>;
    stats?: Array<{
      number: string;
      label: string;
    }>;
    skills?: string[];
    location?: string;
    tagline?: string;
    downloadCV?: string; // CV download link
  };
  about: {
    markdown: string;
    personalInfo?: {
      fullName: string;
      age?: number;
      nationality?: string;
      languages?: string[];
      hobbies?: string[];
    };
    professionalSummary?: string;
    achievements?: Array<{
      title: string;
      description: string;
      year: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      year: string;
      credentialId?: string;
      link?: string;
    }>;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    tech: string[];
    link?: string;
    github?: string;
    image: string;
    // Enhanced project data
    category?: string;
    status?: 'completed' | 'in-progress' | 'planned';
    year?: string;
    role?: string;
    features?: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
    description: string;
    location?: string;
    gpa?: string;
    major?: string;
    logo?: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    year: string;
    description: string;
    location?: string;
    type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
    current?: boolean;
    achievements?: string[];
    technologies?: string[];
    responsibilities?: string[];
    companyLogo?: string;
    companyWebsite?: string;
  }>;
  skills: {
    frontend: string[];
    backend: string[];
    tools: string[];
    databases?: string[];
    cloud?: string[];
    mobile?: string[];
    design?: string[];
    testing?: string[];
    devops?: string[];
    languages?: Array<{
      name: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      yearsOfExperience?: number;
    }>;
    frameworks?: Array<{
      name: string;
      category: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
  };
  contacts: {
    email: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
    discord?: string;
    telegram?: string;
  };
}

interface PortfolioContextType {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  updateData: (currentData: PortfolioData, newData: Partial<PortfolioData>) => Promise<void>;
  refreshData: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleThemeLocal: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
  initialData: PortfolioData;
}

export const PortfolioProvider = ({ children, initialData }: PortfolioProviderProps) => {
  const [data, setData] = useState<PortfolioData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await triggerRevalidation();
      window.location.reload();
    } catch (e) {
      setError("Failed to refresh portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const toggleThemeLocal = () => {
    const newMode = data.theme.currentMode === "dark" ? "light" : "dark";

    // Create updated data with new theme mode
    const updatedData: PortfolioData = {
      ...data,
      theme: {
        ...data.theme,
        currentMode: newMode
      }
    };

    // Update local state
    setData(updatedData);

    // Apply the theme immediately
    applyTheme(updatedData.theme);
  };

  const updateData = async (currentData: PortfolioData, newData: Partial<PortfolioData>): Promise<void> => {
    setLoading(true);
    try {
      // Update via API
      await updatePortfolioData(currentData, newData);

      const updated: PortfolioData = {
        ...data,
        ...newData,
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

      setData(updated);
      if (newData.theme) applyTheme(updated.theme);

      toast.success("Portfolio updated successfully!");
    } catch (err) {
      toast.error("Failed to update portfolio");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: PortfolioData["theme"]) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const modeStyles = theme.styles[theme.currentMode];

    try {
      Object.entries(modeStyles).forEach(([key, val]) => {
        root.style.setProperty(`--${key}`, val.trim());
      });

      root.classList.toggle("dark", theme.currentMode === "dark");

      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    } catch (error) {
      console.error("Error applying theme:", error);
      root.classList.toggle("dark", theme.currentMode === "dark");
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Apply theme on mount
  useEffect(() => {
    if (data?.theme) {
      applyTheme(data.theme);
    }
  }, []);

  // Update data when initialData changes (after ISR revalidation)
  useEffect(() => {
    setData(initialData);
    if (initialData?.theme) {
      applyTheme(initialData.theme);
    }
  }, [initialData]);

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
        logout,
        toggleThemeLocal,

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