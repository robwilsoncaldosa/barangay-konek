import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FeatureCardProps {
  title: string
  description: string
  content: string
}

export function FeatureCard({ title, description, content }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  )
}