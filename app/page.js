import Header from "@/components/custom/Header";
import Hero from "@/components/custom/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex justify-center items-center">
        <Hero />
      </main>
    </div>
  );
}
