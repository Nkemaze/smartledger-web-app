import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { Pagination } from '@/components/ui/Pagination'
import { staffService } from '@/lib/api'
import type { StaffMember } from '@/lib/api'

const roleLabels: Record<StaffMember['role'], string> = {
  OWNER: 'Admin',
  CASHIER: 'Cashier',
  ACCOUNTANT: 'Accountant',
}

const roleTone = (role: StaffMember['role']) =>
  role === 'OWNER' ? 'info' : role === 'ACCOUNTANT' ? 'neutral' : 'outline'

const roles = ['All Roles', 'Admin', 'Cashier', 'Accountant']
const statuses = ['All Status', 'Active', 'Inactive']

const PAGE_SIZE = 8

function StaffRow({ member, onBlock }: { member: StaffMember; onBlock: (id: string) => void }) {
  return (
    <tr className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
      <td className="py-4 px-xl">
        <div className="flex items-center gap-md">
          <Avatar
            initials={member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            className={member.isActive ? '' : 'bg-surface-container-high'}
          />
          <div>
            <p className="font-label text-label-md font-bold text-on-surface">{member.name}</p>
            <p className="text-[12px] text-on-surface-variant">{member.phone}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <Badge tone={roleTone(member.role)}>{roleLabels[member.role]}</Badge>
      </td>
      <td className="py-4 px-4">
        <Badge tone={member.isActive ? 'success' : 'neutral'} dot={member.isActive}>
          {member.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="py-4 px-4 hidden md:table-cell text-[12px] text-on-surface-variant">
        {new Date(member.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1">
          <Link
            to={`/staff/${member.id}`}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
            title="View details"
          >
            <Icon name="visibility" />
          </Link>
          <button
            onClick={() => onBlock(member.id)}
            className="p-2 text-on-surface-variant hover:text-error transition-colors"
            title="Deactivate"
          >
            <Icon name="block" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function StaffList() {
  const [role, setRole] = useState('All Roles')
  const [status, setStatus] = useState('All Status')
  const [page, setPage] = useState(1)
  const [dismissed, setDismissed] = useState(false)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setStaff(await staffService.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load staff.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = staff.filter(
    (m) =>
      (role === 'All Roles' || roleLabels[m.role] === role) &&
      (status === 'All Status' || (status === 'Active' ? m.isActive : !m.isActive))
  )

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleBlock = async (id: string) => {
    setError('')
    try {
      await staffService.remove(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update staff member.')
    }
  }

  const activeCount = staff.filter((m) => m.isActive).length
  const featureMember = staff.find((m) => m.isActive)

  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>Staff Management</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Team Directory</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Team Directory</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            Manage your workforce, permissions, and operational status across all branches.
          </p>
        </div>
        <button className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all">
          <Icon name="person_add" />
          Add New Staff
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-lg bg-error-container/40 rounded-xl px-lg py-md">
          <div className="flex items-center gap-2">
            <Icon name="error_outline" className="text-error" />
            <p className="font-body text-body-sm text-error">{error}</p>
          </div>
          <button className="font-label text-label-md text-error font-bold hover:underline" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <StatCard
          label="Total Staff"
          value={staff.length.toLocaleString()}
          icon="badge"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          trend={{ text: 'Across all branches', tone: 'neutral' }}
        />
        <StatCard
          label="Currently Active"
          value={activeCount.toLocaleString()}
          icon="bolt"
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          progress={staff.length > 0 ? (activeCount / staff.length) * 100 : 0}
          progressColor="bg-secondary"
        />
        <StatCard
          label="Inactive Accounts"
          value={(staff.length - activeCount).toString().padStart(2, '0')}
          icon="person_off"
          iconBg="bg-tertiary/10"
          iconColor="text-tertiary"
          trend={{
            text: staff.length - activeCount > 0 ? 'Review access' : 'All active',
            tone: staff.length - activeCount > 0 ? 'down' : 'up',
          }}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-xl py-lg flex flex-col xl:flex-row xl:items-center gap-lg justify-between border-b border-outline-variant/5">
          <div className="flex items-center gap-md overflow-x-auto pb-1">
            <div className="flex items-center gap-1">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r)
                    setPage(1)
                  }}
                  className={`whitespace-nowrap px-md py-2 rounded-full font-label text-label-md transition-all ${
                    role === r
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/25'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-outline-variant/20 mx-2" />
            <div className="flex items-center gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s)
                    setPage(1)
                  }}
                  className={`whitespace-nowrap px-md py-2 rounded-full font-label text-label-md transition-all ${
                    status === s
                      ? 'bg-secondary text-on-primary shadow-md shadow-secondary/25'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 h-10 px-lg bg-surface-container-low rounded-lg font-label text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors w-fit">
            <Icon name="filter_list" />
            More Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-md">
              <span className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="badge" className="text-on-surface-variant" />
              </span>
              <p className="font-label text-label-md font-bold text-on-surface">No staff match these filters</p>
              <p className="text-[12px] text-on-surface-variant">Try clearing the role or status filter.</p>
            </div>
          ) : (
            <table className="w-full min-w-[540px] md:min-w-[760px] text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/20 bg-surface-container-low/50">
                  <th className="py-3 px-xl font-semibold">Name & Profile</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">Joined</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((m) => (
                  <StaffRow key={m.id} member={m} onBlock={handleBlock} />
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && (
          <Pagination
            page={page}
            pages={pages}
            showing={`Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} employees`}
            onPage={setPage}
          />
        )}
      </Card>

      {!dismissed && (
        <Card className="p-xl flex flex-col md:flex-row md:items-center gap-lg bg-gradient-to-br from-secondary-container/20 to-primary-container/20">
          <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="psychology" className="text-on-primary text-[28px]" />
          </span>
          <div className="flex-1">
            <p className="font-label text-label-sm text-primary uppercase tracking-wider mb-1">AI Recommendation</p>
            <p className="font-body text-body-md text-on-surface">
              Peak sales traffic detected for <span className="font-bold">Saturday between 2PM-5PM</span>. We recommend
              scheduling <span className="font-bold">2 additional Sales Associates</span> for that shift.
            </p>
          </div>
          <button className="flex items-center gap-2 h-11 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors flex-shrink-0">
            Apply to Schedule
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0" onClick={() => setDismissed(true)}>
            <Icon name="close" />
          </button>
        </Card>
      )}

      {featureMember && (
        <div className="text-right">
          <Link to={`/staff/${featureMember.id}`} className="font-label text-label-md text-primary hover:underline font-bold">
            View staff details →
          </Link>
        </div>
      )}
    </div>
  )
}
