import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { subscriptionService } from '@/lib/api'
import type { ApiSubscription } from '@/lib/api'

// How many days before the trial ends we start nudging the user.
const TRIAL_WARNING_DAYS = 5

/**
 * Shows a banner while the 1-month free trial is about to end or once the
 * subscription has expired, linking to the billing tab so the owner can
 * pick a plan (Business Plan §2.4).
 */
export function SubscriptionBanner() {
  const [subscription, setSubscription] = useState<ApiSubscription | null>(null)

  useEffect(() => {
    let cancelled = false
    subscriptionService
      .me()
      .then((sub) => {
        if (!cancelled) setSubscription(sub)
      })
      .catch(() => {
        // Offline or logged out — the app itself handles those states.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!subscription) return null

  const expiring =
    subscription.status === 'TRIALING' &&
    subscription.daysRemaining !== null &&
    subscription.daysRemaining <= TRIAL_WARNING_DAYS
  const expired = subscription.status === 'EXPIRED'

  if (!expiring && !expired) return null

  return (
    <div
      className={`${
        expired ? 'bg-error-container text-on-error-container' : 'bg-amber-50 text-amber-900'
      } -mx-gutter mb-lg rounded-b-2xl`}
    >
      <div className="px-lg py-md flex flex-col sm:flex-row sm:items-center gap-2">
        <Icon name={expired ? 'lock' : 'schedule'} className="text-[18px]" />
        <p className="font-label text-label-md font-medium flex-1">
          {expired
            ? 'Your SmartLedger subscription has expired — core features are locked until you renew.'
            : `Your free trial ends in ${subscription.daysRemaining} day${subscription.daysRemaining === 1 ? '' : 's'}. Pick a plan to keep going.`}
        </p>
        <Link
          to="/settings?tab=billing"
          className={`inline-flex items-center gap-1 font-label text-label-md font-bold underline underline-offset-4 hover:no-underline`}
        >
          Choose a plan
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>
    </div>
  )
}
