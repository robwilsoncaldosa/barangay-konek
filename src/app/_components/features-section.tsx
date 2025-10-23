import { FeatureCard } from './feature-card'
import { featuresData } from '@/server/features'

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-12 md:mb-16 text-center">
        <h2 className="mb-3 md:mb-4 text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Powerful Features
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete tools designed to revolutionize how your barangay serves the community
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {featuresData.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            content={feature.content}
            badge={feature.badge}
          />
        ))}
      </div>
    </section>
  )
}