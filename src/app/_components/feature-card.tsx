import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
            <Badge 
              variant={badge.variant === 'beta' ? 'default' : 'secondary'}
              className={
                badge.variant === 'beta' 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:text-white' 
                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200'
              }
            >
              {badge.text}
            </Badge>
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