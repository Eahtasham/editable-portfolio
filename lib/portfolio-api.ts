// lib/portfolio-api.ts
import { PortfolioData } from '../context/PortfolioContext';

const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID ?? "";
const API_KEY = "$2a$10$kmpv8tBl6D2fT78OSLbNueGY3Y8xGUMDwAiaNvGcgesef00npPyaK";

// Default data fallback
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
  sectionOrder: {
    hero: 1,
    about: 2,
    projects: 3,
    experience: 4,
    education: 5,
    contacts: 6
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
      next: { revalidate: 0 }
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