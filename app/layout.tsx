import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { fetchPortfolioData, generateThemeCSS } from '@/lib/portfolio-api';
import { PortfolioData, PortfolioProvider } from '@/context/PortfolioContext';
import { cache } from 'react';

const inter = Inter({ subsets: ['latin'] });


export const revalidate = 60;; // Revalidate every day

const getCachedPortfolioData = (async () => {
  try {
    return await fetchPortfolioData();
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error);
    // You might want to return fallback data or re-throw
    throw error;
  }
});


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const portfolioData = await getCachedPortfolioData();
    
    const themeStyles = portfolioData.theme.styles[portfolioData.theme.currentMode];
    const initialThemeStyles = generateThemeCSS(themeStyles, portfolioData.theme.currentMode);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
              <style 
        dangerouslySetInnerHTML={{ 
          __html: initialThemeStyles 
        }} 
      />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PortfolioProvider initialData={portfolioData}>
        {children}
        <Toaster position="bottom-right" />
        </PortfolioProvider>
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const portfolioData = await getCachedPortfolioData();
    
    return {
      title: portfolioData?.hero?.heading || 'Portfolio',
      description: portfolioData?.hero?.subheading || 'Professional Portfolio',
      // Add more SEO metadata
      openGraph: {
        title: portfolioData?.hero?.heading || 'Portfolio',
        description: portfolioData?.hero?.subheading || 'Professional Portfolio',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: portfolioData?.hero?.heading || 'Portfolio',
        description: portfolioData?.hero?.subheading || 'Professional Portfolio',
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    // Fallback metadata if fetch fails
    return {
      title: 'Portfolio',
      description: 'Professional Portfolio',
    };
  }
}
