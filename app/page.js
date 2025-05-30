import Header from "@/components/custom/Header";
import Hero from "@/components/custom/Hero";
import LandingPageSections from "@/components/custom/LandingPageSections";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-1">
        <Hero />
        <LandingPageSections />
      </main>
    </div>
  );
}
