import { Header } from './_components/header'
import { HeroSection } from './_components/hero-section'
import { AboutSection } from './_components/about-section'
import { FeaturesSection } from './_components/features-section'
import { Footer } from './_components/footer'
import Chatbot from "@/components/ui/chats";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <AboutSection />
      <Chatbot />
      <FeaturesSection />
      <Footer />
    </div>
  )
}
