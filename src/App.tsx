import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider, RequireAuth, GuestOnly } from '@/lib/auth/AuthContext'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { OtpVerification } from '@/pages/OtpVerification'
import { BusinessSetup } from '@/pages/BusinessSetup'
import { ProductOnboarding } from '@/pages/ProductOnboarding'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Inventory = lazy(() => import('@/pages/Inventory').then((m) => ({ default: m.Inventory })))
const SalesTransactions = lazy(() => import('@/pages/SalesTransactions').then((m) => ({ default: m.SalesTransactions })))
const TaxSummary = lazy(() => import('@/pages/TaxSummary').then((m) => ({ default: m.TaxSummary })))
const ComplianceReports = lazy(() => import('@/pages/ComplianceReports').then((m) => ({ default: m.ComplianceReports })))
const DigitalArchive = lazy(() => import('@/pages/DigitalArchive').then((m) => ({ default: m.DigitalArchive })))
const VatLedger = lazy(() => import('@/pages/VatLedger').then((m) => ({ default: m.VatLedger })))
const AiAdvisor = lazy(() => import('@/pages/AiAdvisor').then((m) => ({ default: m.AiAdvisor })))
const StaffList = lazy(() => import('@/pages/StaffList').then((m) => ({ default: m.StaffList })))
const StaffDetails = lazy(() => import('@/pages/StaffDetails').then((m) => ({ default: m.StaffDetails })))
const PermissionsRoles = lazy(() => import('@/pages/PermissionsRoles').then((m) => ({ default: m.PermissionsRoles })))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function SuspenseRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <SignUp />
            </GuestOnly>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <GuestOnly>
              <OtpVerification />
            </GuestOnly>
          }
        />
        <Route
          path="/setup"
          element={
            <RequireAuth>
              <BusinessSetup />
            </RequireAuth>
          }
        />
        <Route
          path="/setup-products"
          element={
            <RequireAuth>
              <ProductOnboarding />
            </RequireAuth>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<SuspenseRoute><Dashboard /></SuspenseRoute>} />
          <Route path="/inventory" element={<SuspenseRoute><Inventory /></SuspenseRoute>} />
          <Route path="/sales" element={<SuspenseRoute><SalesTransactions /></SuspenseRoute>} />
          <Route path="/tax" element={<SuspenseRoute><TaxSummary /></SuspenseRoute>} />
          <Route path="/reports" element={<SuspenseRoute><ComplianceReports /></SuspenseRoute>} />
          <Route path="/archive" element={<SuspenseRoute><DigitalArchive /></SuspenseRoute>} />
          <Route path="/vat-ledger" element={<SuspenseRoute><VatLedger /></SuspenseRoute>} />
          <Route path="/advisor" element={<SuspenseRoute><AiAdvisor /></SuspenseRoute>} />
          <Route path="/staff" element={<SuspenseRoute><StaffList /></SuspenseRoute>} />
          <Route path="/staff/:id" element={<SuspenseRoute><StaffDetails /></SuspenseRoute>} />
          <Route path="/permissions" element={<SuspenseRoute><PermissionsRoles /></SuspenseRoute>} />
          <Route path="/customers" element={<PlaceholderPage title="Customers" icon="groups" description="Manage your customer relationships and loyalty programs." />} />
          <Route path="/suppliers" element={<PlaceholderPage title="Suppliers" icon="local_shipping" description="Manage your supplier relationships and purchase orders." />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" icon="settings" description="Configure your store preferences and integrations." />} />
          <Route path="*" element={<SuspenseRoute><Dashboard /></SuspenseRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
