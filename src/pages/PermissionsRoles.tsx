import { Fragment } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { Icon } from '@/components/ui/Icon'
import { permissions, recentChanges } from '@/data/mock'

const roles = [
  { icon: 'security', iconClass: 'bg-primary/10 text-primary', name: 'Admin', desc: 'Full Access' },
  { icon: 'manage_accounts', iconClass: 'bg-secondary/10 text-secondary', name: 'Manager', desc: 'Operations' },
  { icon: 'person', iconClass: 'bg-tertiary/10 text-tertiary', name: 'Staff', desc: 'Frontline' },
]

type CellValue = boolean | string

function PermCell({ value }: { value: CellValue }) {
  if (value === 'denied') {
    return (
      <span className="inline-flex items-center gap-1 font-label text-label-sm text-error font-bold">
        <Icon name="block" className="text-[16px]" />
        Denied
      </span>
    )
  }
  const checked = value === true || value === 'full' || value === 'disabled-checked' || value === 'disabled-off'
  const disabled = typeof value === 'string'
  return <Toggle checked={checked} disabled={disabled} disabledColor={disabled && value !== 'disabled-off'} />
}

export function PermissionsRoles() {
  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>Staff Management</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Role Permissions</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Role Permissions</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1 max-w-2xl">
            Manage organizational hierarchy and feature access across your workforce. Changes propagate instantly to all
            active sessions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          <Badge tone="info" icon="verified_user">
            Active Roles 08
          </Badge>
          <button className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all">
            <Icon name="add" />
            Create Custom Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {roles.map((r) => (
          <Card key={r.name} className="p-xl flex items-center gap-lg">
            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.iconClass}`}>
              <Icon name={r.icon} className="text-[24px]" />
            </span>
            <div>
              <p className="font-headline text-title-lg text-on-surface">{r.name}</p>
              <p className="font-label text-label-sm text-on-surface-variant">{r.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-xl py-lg flex items-center justify-between border-b border-outline-variant/5">
          <div className="flex items-center gap-md">
            <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center">
              <Icon name="grid_view" className="text-secondary" />
            </span>
            <div>
              <h3 className="font-headline text-headline-md text-on-surface">Feature Matrix</h3>
              <p className="font-label text-label-sm text-on-surface-variant">System Capabilities</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-wider text-outline border-b border-outline-variant/10 bg-surface-container-low/40">
                <th className="py-3 px-xl font-semibold">System Capabilities</th>
                <th className="py-3 px-4 font-semibold text-center">Admin</th>
                <th className="py-3 px-4 font-semibold text-center">Manager</th>
                <th className="py-3 px-4 font-semibold text-center">Staff</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((section, si) => (
                <Fragment key={si}>
                  {si > 0 && (
                    <tr>
                      <td colSpan={4} className="h-3" />
                    </tr>
                  )}
                  <tr className="bg-surface-container-low/30">
                    <td colSpan={4} className="px-xl py-3">
                      <p className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider">
                        {section.section}
                      </p>
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.name} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-xl">
                        <div className="flex items-center gap-md">
                          <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                            <Icon name={row.icon} />
                          </span>
                          <div>
                            <p className="font-label text-label-md font-bold text-on-surface">{row.name}</p>
                            <p className="text-[12px] text-on-surface-variant">{row.helper}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <PermCell value={row.admin} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <PermCell value={row.manager} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <PermCell value={row.staff} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">
        <Card className="p-xl">
          <div className="flex items-center gap-md mb-lg">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="layers" />
            </span>
            <div>
              <h3 className="font-headline text-headline-md text-on-surface">New Template Role</h3>
              <p className="font-label text-label-sm text-on-surface-variant">
                Quickly scaffold a new role by duplicating an existing one.
              </p>
            </div>
          </div>
          <div className="space-y-lg">
            <div className="flex flex-col gap-1">
              <label className="font-label text-label-md text-on-surface-variant">Base Permissions On</label>
              <div className="relative">
                <select className="w-full h-11 px-lg bg-surface-container rounded-xl appearance-none font-label text-label-md text-on-surface cursor-pointer">
                  <option disabled selected>
                    Select existing role...
                  </option>
                  <option>Manager Template</option>
                  <option>Staff Template</option>
                </select>
                <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label text-label-md text-on-surface-variant">Role Name</label>
              <input className="w-full h-11 px-lg bg-surface-container rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Regional Manager" />
            </div>
            <button className="w-full h-11 bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
              <Icon name="edit" />
              Initialize Role Editor
            </button>
          </div>
        </Card>

        <Card className="p-xl">
          <div className="flex items-center gap-md mb-lg">
            <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Icon name="history" />
            </span>
            <h3 className="font-headline text-headline-md text-on-surface">Recent Changes</h3>
          </div>
          <div className="space-y-md">
            {recentChanges.map((c) => (
              <div key={c.title} className="flex items-start gap-md">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${c.color}`} />
                <div>
                  <p className="font-label text-label-md font-semibold text-on-surface">{c.title}</p>
                  <p className="text-[12px] text-on-surface-variant">{c.meta}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-lg flex items-center gap-1 font-label text-label-md text-primary hover:underline font-bold">
            View Full Audit Log
            <Icon name="arrow_forward" />
          </button>
        </Card>
      </div>
    </div>
  )
}
