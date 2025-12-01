// lib/portfolio-api.ts
import { PortfolioData } from '../context/PortfolioContext';

const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID ?? "";
const API_KEY = "$2a$10$kmpv8tBl6D2fT78OSLbNueGY3Y8xGUMDwAiaNvGcgesef00npPyaK";

// Default data fallback
const defaultData: PortfolioData = {
  theme: {
    styles: {
      light: {
        background: "oklch(97.51% 0.0127 244.2507)",
        foreground: "oklch(37.29% 0.0306 259.7328)",
        card: "oklch(100% 0 0)",
        "card-foreground": "oklch(37.29% 0.0306 259.7328)",
        popover: "oklch(100% 0 0)",
        "popover-foreground": "oklch(37.29% 0.0306 259.7328)",
        primary: "oklch(72.27% 0.192 149.5793)",
        "primary-foreground": "oklch(100% 0 0)",
        secondary: "oklch(95.14% 0.025 236.8242)",
        "secondary-foreground": "oklch(44.61% 0.0263 256.8018)",
        muted: "oklch(96.7% 0.0029 264.5419)",
        "muted-foreground": "oklch(55.1% 0.0234 264.3637)",
        accent: "oklch(95.05% 0.0507 163.0508)",
        "accent-foreground": "oklch(37.29% 0.0306 259.7328)",
        destructive: "oklch(63.68% 0.2078 25.3313)",
        "destructive-foreground": "oklch(100% 0 0)",
        border: "oklch(92.76% 0.0058 264.5313)",
        input: "oklch(92.76% 0.0058 264.5313)",
        ring: "oklch(72.27% 0.192 149.5793)",
      },
      dark: {
        background: "oklch(20.77% 0.0398 265.7549)",
        foreground: "oklch(87.17% 0.0093 258.3382)",
        card: "oklch(27.95% 0.0368 260.0310)",
        "card-foreground": "oklch(87.17% 0.0093 258.3382)",
        popover: "oklch(27.95% 0.0368 260.0310)",
        "popover-foreground": "oklch(87.17% 0.0093 258.3382)",
        primary: "oklch(77.29% 0.1535 163.2231)",
        "primary-foreground": "oklch(20.77% 0.0398 265.7549)",
        secondary: "oklch(33.51% 0.0331 260.9120)",
        "secondary-foreground": "oklch(71.18% 0.0129 286.0665)",
        muted: "oklch(27.95% 0.0368 260.0310)",
        "muted-foreground": "oklch(55.1% 0.0234 264.3637)",
        accent: "oklch(37.29% 0.0306 259.7328)",
        "accent-foreground": "oklch(71.18% 0.0129 286.0665)",
        destructive: "oklch(63.68% 0.2078 25.3313)",
        "destructive-foreground": "oklch(20.77% 0.0398 265.7549)",
        border: "oklch(44.61% 0.0263 256.8018)",
        input: "oklch(44.61% 0.0263 256.8018)",
        ring: "oklch(77.29% 0.1535 163.2231)",
      },
    },

    currentMode: "dark",
  },
  sectionOrder: {
    hero: 1,
    about: 2,
    projects: 3,
    experience: 4,
    skills: 5,
    education: 6,
    contacts: 7
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
  education: [
    {
      id: "1",
      institution: "University of Example",
      degree: "Bachelor of Science in Computer Science",
      year: "2020 - 2024",
      description: "Graduated with honors",
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

export async function fetchPortfolioData(): Promise<PortfolioData> {
  try {
    console.log('Fetching portfolio data...');

    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
      // Important for ISR: Don't cache this request
      // next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    console.log('Portfolio data fetched successfully');

    return result.record || defaultData;
    // return defaultData;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    console.log('Falling back to default data');
    return defaultData;
  }
}

export function generateThemeCSS(styles: Record<string, string>, mode: 'light' | 'dark'): string {
  const cssVariables = Object.entries(styles)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

  return `
    :root {
${cssVariables}
    }
    ${mode === 'dark' ? '' : ''}
    body {
      transition: background-color 0.3s ease, color 0.3s ease;
    }
  `;
}

export function getDeviconUrl(techName: any) {
  const formattedName = techName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${formattedName}/${formattedName}-original.svg`;
}

// // Client-side API functions for admin updates
// export async function updatePortfolioData(newData: Partial<PortfolioData>): Promise<void> {
//   const currentData = await fetchPortfolioData();

//   const updated: PortfolioData = {
//     ...currentData,
//     ...newData,
//     ...(newData.theme && {
//       theme: {
//         ...currentData.theme,
//         ...newData.theme,
//         styles: {
//           ...currentData.theme.styles,
//           ...newData.theme.styles,
//         },
//       },
//     }),
//   };

//   const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Master-Key": API_KEY,
//     },
//     body: JSON.stringify(updated),
//   });

//   if (!res.ok) {
//     throw new Error(`Update failed: ${res.status}`);
//   }

//   // Trigger revalidation
//   await triggerRevalidation();
// }

export async function updatePortfolioData(currentData: PortfolioData, newData: Partial<PortfolioData>): Promise<void> {
  const updated: PortfolioData = {
    ...currentData,
    ...newData,
    ...(newData.theme && {
      theme: {
        ...currentData.theme,
        ...newData.theme,
        styles: {
          ...currentData.theme.styles,
          ...newData.theme.styles,
        },
      },
    }),
  };

  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    throw new Error(`Update failed: ${res.status}`);
  }

  await triggerRevalidation();
}

export async function triggerRevalidation(path: string = '/'): Promise<void> {
  try {
    await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATION_SECRET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
  } catch (error) {
    console.error('Failed to trigger revalidation:', error);
  }
}

export const applyTheme = (theme: PortfolioData["theme"], mode: 'light' | 'dark') => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const modeStyles = mode;

  try {
    Object.entries(modeStyles).forEach(([key, val]) => {
      root.style.setProperty(`--${key}`, val.trim());
    });

    root.classList.toggle("dark", mode === "dark");

    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';

  } catch (error) {
    console.error("Error applying theme:", error);
    root.classList.toggle("dark", mode === "dark");
  }
};