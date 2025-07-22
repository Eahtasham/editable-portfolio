// app/page.tsx
import { PortfolioData } from '../context/PortfolioContext';
import HomePage from '../components/custom/HomePage';
import { fetchPortfolioData, generateThemeCSS } from '../lib/portfolio-api';

// This enables ISR with 60 second revalidation
export const revalidate = 60;

export default async function Page() {
  // Fetch data at build time and on revalidation
  const portfolioData = await fetchPortfolioData();
  
  // Generate critical CSS for theme
  const themeStyles = portfolioData.theme.styles[portfolioData.theme.currentMode];
  const initialThemeStyles = generateThemeCSS(themeStyles, portfolioData.theme.currentMode);

  return (
    <>
      {/* Inject critical CSS for theme styles to prevent flickering */}
      <style 
        dangerouslySetInnerHTML={{ 
          __html: initialThemeStyles 
        }} 
      />
      <HomePage data={portfolioData} />
    </>
  );
}

// Optional: Generate metadata dynamically
export async function generateMetadata() {
  const portfolioData = await fetchPortfolioData();
  
  return {
    title: portfolioData.hero.heading,
    description: portfolioData.hero.subheading,
  };
}