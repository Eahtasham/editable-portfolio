import { PortfolioProvider } from '@/context/PortfolioContext';
import HomePage from '../components/custom/HomePage';
import { fetchPortfolioData, generateThemeCSS } from '../lib/portfolio-api';

// export const revalidate = 60;

export default async function Page() {

  return (
    <>
      <HomePage />
    </>
  );
}
