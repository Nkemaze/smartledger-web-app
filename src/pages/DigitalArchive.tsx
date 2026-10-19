import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Icon } from '@/components/ui/Icon'
import { apiAssetUrl, archiveService } from '@/lib/api'
import type { ApiDocument } from '@/lib/api'

const tabs = ['All', 'Sales Invoices', 'Expense Receipts', 'Tax Documents']
const sortOptions = ['Recently Added', 'Invoice Date', 'Total Amount']

const typeMeta: Record<string, { tab: string; icon: string; label: string }> = {
  receipt: { tab: 'Expense Receipts', icon: 'shopping_bag', label: 'Expense Receipt' },
  invoice: { tab: 'Sales Invoices', icon: 'receipt', label: 'Sales Invoice' },
  statement: { tab: 'Tax Documents', icon: 'description', label: 'Tax Document' },
  tax: { tab: 'Tax Documents', icon: 'description', label: 'Tax Document' },
}

const metaFor = (type: string) => typeMeta[type] ?? { tab: 'All', icon: 'description', label: 'Document' }

const formatSize = (bytes?: number | null) => {
  if (!bytes) return '0 KB'
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

const formatMoney = (v?: number | string | null) =>
  `FCFA ${Math.round(Number(v ?? 0)).toLocaleString()}`

export function DigitalArchive() {
  const [tab, setTab] = useState('All')
  const [sort, setSort] = useState('Recently Added')
  const [docs, setDocs] = useState<ApiDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setDocs(await archiveService.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = docs
    .filter((d) => tab === 'All' || metaFor(d.type).tab === tab)
    .sort((a, b) => {
      if (sort === 'Invoice Date') return +new Date(a.createdAt) - +new Date(b.createdAt)
      if (sort === 'Total Amount') return Number(b.transaction?.amount ?? 0) - Number(a.transaction?.amount ?? 0)
      return +new Date(b.createdAt) - +new Date(a.createdAt)
    })

  const totalBytes = docs.reduce((sum, d) => sum + (d.fileSize ?? 0), 0)
  const usedGb = totalBytes / (1024 * 1024 * 1024)
  const storagePercent = Math.min(100, (usedGb / 50) * 100)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      await archiveService.upload(file, 'receipt')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc: ApiDocument) => {
    setDeletingId(doc.id)
    setError('')
    try {
      await archiveService.remove(doc.id)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete document.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-xl">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleUpload(file)
          e.target.value = ''
        }}
      />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-lg">
        <div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant mb-1">
            <span>SmartLedger</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">Documents</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Digital Archive</h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            Securely store, search, and share your business documents.
          </p>
        </div>
        <button
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 h-11 px-lg bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="cloud_upload" />
          {uploading ? 'Uploading…' : 'Upload Receipt'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <Card className="p-xl flex flex-col lg:flex-row lg:items-center gap-lg bg-gradient-to-br from-secondary-container/20 to-primary-container/20">
          <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="auto_awesome" className="text-on-primary text-[28px]" />
          </span>
          <div className="flex-1">
            <h3 className="font-headline text-headline-md text-on-surface mb-1">Intelligent Archive Audit</h3>
            <p className="font-body text-body-md text-on-surface-variant">
              {docs.length === 0
                ? 'Upload receipts and invoices to let AI verify duplicates and flag entries missing tax ID information.'
                : 'AI verified your uploaded documents. Automated checks flag any duplicate or incomplete metadata.'}
            </p>
          </div>
          <button className="flex items-center gap-2 h-10 px-lg bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors flex-shrink-0">
            Review Now
          </button>
        </Card>
        <Card className="p-xl flex flex-col lg:flex-row lg:items-center gap-lg">
          <span className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0">
            <Icon name="sync" className="text-secondary text-[28px]" />
          </span>
          <div className="flex-1">
            <h3 className="font-headline text-headline-md text-on-surface mb-1">Mobile Sync</h3>
            <p className="font-body text-body-md text-on-surface-variant">Scan receipts on the go</p>
            <p className="font-label text-label-md font-bold text-primary mt-1">App connected: iPhone 15 Pro</p>
          </div>
          <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
            <Icon name="qr_code_2" className="text-[24px]" />
          </span>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-lg justify-between">
        <div className="flex items-center gap-md overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap px-lg py-2.5 rounded-full font-label text-label-md transition-all ${
                tab === t
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/25'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label text-label-sm text-on-surface-variant">Sort By:</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-lg pr-10 bg-surface-container-lowest border border-outline-variant/40 rounded-xl appearance-none font-label text-label-md text-on-surface cursor-pointer shadow-sm"
            >
              {sortOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-xl">
          {loading ? (
            <div className="lg:col-span-2 flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="lg:col-span-2 rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-lowest p-xl flex flex-col items-center justify-center text-center gap-md min-h-[220px]">
              <span className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
                <Icon name="folder_open" className="text-[28px] text-primary" />
              </span>
              <div>
                <p className="font-label text-label-md font-bold text-on-surface mb-1">No documents {tab !== 'All' ? 'in this category' : 'yet'}</p>
                <p className="text-[12px] text-on-surface-variant">Upload a receipt or invoice to get started.</p>
              </div>
            </div>
          ) : (
            filtered.map((doc) => {
              const meta = metaFor(doc.type)
              return (
                <Card key={doc.id} className="p-lg flex flex-col gap-lg">
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex items-center gap-md">
                      <span className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon name={meta.icon} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-label text-label-md font-bold text-on-surface truncate">{doc.fileName ?? doc.id}</p>
                        <p className="text-[12px] text-on-surface-variant">{meta.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge tone="success" icon="check_circle">
                        Verified
                      </Badge>
                      <button
                        onClick={() => void handleDelete(doc)}
                        disabled={deletingId === doc.id}
                        className="w-8 h-8 rounded-lg hover:bg-error-container/50 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Icon name="delete_outline" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-body text-body-md text-on-surface">{doc.transaction ? `#${doc.transaction.id.slice(0, 8).toUpperCase()}` : 'Unlinked document'}</p>
                    <p className="font-headline text-title-lg text-primary mt-1">
                      {doc.transaction ? formatMoney(doc.transaction.amount) : formatSize(doc.fileSize)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar_today" className="text-[14px]" />
                      {new Date(doc.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="category" className="text-[14px]" />
                      {meta.label}
                    </span>
                  </div>
                  <div className="border-t border-outline-variant/10 pt-lg flex items-center justify-between">
                    <a
                      href={apiAssetUrl(doc.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-label text-label-md text-primary font-bold hover:underline"
                    >
                      <Icon name="visibility" className="text-[16px]" />
                      View Full Doc
                    </a>
                    <span className="text-[12px] text-on-surface-variant">{formatSize(doc.fileSize)}</span>
                  </div>
                </Card>
              )
            })
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-2xl border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center gap-md bg-surface-container-lowest min-h-[180px] hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="add" className="text-[28px] text-primary" />
            </span>
            <div>
              <p className="font-label text-label-md font-bold text-on-surface mb-1">{uploading ? 'Uploading…' : 'Drop file here'}</p>
              <p className="text-[12px] text-on-surface-variant">PDF, JPG up to 10MB</p>
            </div>
          </button>
        </div>

        <Card className="p-xl space-y-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-headline-md text-on-surface">Storage Used</h3>
            <Icon name="cloud_done" className="text-primary" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-headline text-title-lg text-on-surface">{usedGb >= 1 ? `${usedGb.toFixed(1)} GB` : `${Math.round(totalBytes / 1024).toLocaleString()} KB`}</span>
              <span className="font-label text-label-md text-on-surface-variant">/ 50 GB</span>
            </div>
            <ProgressBar value={storagePercent} color="bg-primary" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label text-label-sm text-on-surface-variant">Documents</p>
              <p className="font-headline text-headline-md text-on-surface">{docs.length.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-label text-label-sm text-on-surface-variant">AI Categories</p>
              <p className="font-headline text-headline-md text-on-surface">98%</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 h-11 bg-surface-container rounded-xl font-label text-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors">
            <Icon name="folder_zip" />
            Export All (ZIP)
          </button>
          <button className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-on-primary rounded-xl font-label text-label-md font-bold shadow-lg shadow-primary/25 hover:bg-primary-container transition-colors">
            <Icon name="ios_share" />
            Share with Accountant
          </button>
        </Card>
      </div>
    </div>
  )
}
