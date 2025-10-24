import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NeumorphEyebrow } from '@/components/ui/neumorph-eyebrow'

interface FeatureCardProps {
  title: string
  description: string
  content: string
  badge?: {
    text: string
    variant: 'beta' | 'coming-soon'
  }
}

export function FeatureCard({ title, description, content, badge }: FeatureCardProps) {
  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card dark:bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {badge && (
            <NeumorphEyebrow
              intent={badge.variant === 'beta' ? 'primary' : 'secondary'}
            >
              {badge.text}
            </NeumorphEyebrow>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  )
} 