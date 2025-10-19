import { getUser } from '@/server/user'
import { handleUserRedirect } from '@/server/user'
import { Header } from './_components/header'
import { HeroSection } from './_components/hero-section'
import { FeaturesSection } from './_components/features-section'
import { AboutSection } from './_components/about-section'
import { Footer } from './_components/footer'

export default async function HomePage() {
  const user = await getUser()

  // Redirect authenticated users to their respective dashboards
  await handleUserRedirect(user)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </div>
  )
}
