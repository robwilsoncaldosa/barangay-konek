import { FeatureCard } from './feature-card'
import { featuresData } from '@/server/features'

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          Key Features
        </h2>
        <p className="text-lg text-muted-foreground">
          Everything you need to manage your barangay effectively
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuresData.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            content={feature.content}
          />
        ))}
      </div>
    </section>
  )
}