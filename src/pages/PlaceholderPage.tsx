import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'

export function PlaceholderPage({ title, icon, description }: { title: string; icon: string; description: string }) {
  return (
    <div className="space-y-xl">
      <div>
        <h1 className="font-headline text-headline-lg text-on-surface">{title}</h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">{description}</p>
      </div>
      <Card className="p-3xl flex flex-col items-center justify-center text-center gap-lg min-h-[50vh]">
        <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon name={icon} className="text-[32px]" />
        </span>
        <div>
          <p className="font-headline text-headline-md text-on-surface mb-1">Coming soon</p>
          <p className="font-body text-body-md text-on-surface-variant max-w-sm">
            This module is part of the planned roadmap. Check back after the initial release.
          </p>
        </div>
      </Card>
    </div>
  )
}
