import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { fetchPortfolioData, generateThemeCSS } from '@/lib/portfolio-api';
import { PortfolioData, PortfolioProvider } from '@/context/PortfolioContext';

const inter = Inter({ subsets: ['latin'] });


export const revalidate = 3600; // Revalidate every hour

let portfolioData: PortfolioData;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    portfolioData = await fetchPortfolioData();
    
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

export async function generateMetadata() {
  
  return {
    title: portfolioData?.hero.heading,
    description: portfolioData?.hero.subheading,
  };
}