import { PortfolioProvider } from '@/context/PortfolioContext';
import HomePage from '../components/custom/HomePage';
import { fetchPortfolioData, generateThemeCSS } from '../lib/portfolio-api';
import { CustomCursor } from '@/components/custom/custom-cursor';
import { FloatingActions } from '@/components/custom/floating-action';

// export const revalidate = 60;

export default async function Page() {

  return (
    <>
      <HomePage />
      <CustomCursor />
      <FloatingActions />
    </>
  );
}
