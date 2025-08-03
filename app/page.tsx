import HomePage from '../components/custom/HomePage';
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
