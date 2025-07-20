import PageContent from "@/components/custom/page-content";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <div className="min-h-screen">
      <PageContent />
      <Toaster />
    </div>
  );
}
