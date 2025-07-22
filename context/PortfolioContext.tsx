// context/PortfolioContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { updatePortfolioData, triggerRevalidation } from "../lib/portfolio-api";

// Keep your existing PortfolioData interface
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
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  updateData: (newData: Partial<PortfolioData>) => Promise<void>;
  refreshData: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
      // Trigger a page revalidation instead of client-side fetch
      await triggerRevalidation();
      // Refresh the page to get updated data
      window.location.reload();
    } catch (e) {
      setError("Failed to refresh portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData: Partial<PortfolioData>) => {
    setLoading(true);
    try {
      // Update via API
      await updatePortfolioData(newData);
      
      // Update local state immediately for better UX
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
      
      // Smooth transition
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      
    } catch (error) {
      console.error("Error applying theme:", error);
      root.classList.toggle("dark", theme.currentMode === "dark");
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const adminEmail = "admin@portfolio.com";
    const adminPassword = "admin123";
    
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