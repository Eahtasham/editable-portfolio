import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { fetchPortfolioData, generateThemeCSS } from '@/lib/portfolio-api';
import { PortfolioData, PortfolioProvider } from '@/context/PortfolioContext';
import { cache } from 'react';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });


export const revalidate = 60 * 60 * 24;; // Revalidate every day
// export const revalidate = 10;

const getCachedPortfolioData = cache(async () => {
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
        <Script src="https://onescript.xyz/widget.js" data-id="92c5db84-0264-480f-b32c-a9d0c555ae44" strategy="afterInteractive"></Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PortfolioProvider initialData={portfolioData}>
          {children}
          {/* <CustomCursor /> */}
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
      icons: {
        icon: portfolioData?.hero?.image || '/favicon.png',
      },
      // Add more SEO metadata
      openGraph: {
        title: portfolioData?.hero?.heading || 'Portfolio',
        description: portfolioData?.hero?.subheading || 'Professional Portfolio',
        type: 'website',
        images: [
          {
            url: portfolioData?.hero?.image || '/favicon.png',
            width: 800,
            height: 600
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: portfolioData?.hero?.heading || 'Portfolio',
        description: portfolioData?.hero?.subheading || 'Professional Portfolio',
        images: [
          {
            url: portfolioData?.hero?.image || '/favicon.png',
            width: 800,
            height: 600
          }
        ]
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
