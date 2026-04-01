import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Painel Admin | Goju-Ryu Karate Kai' }

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark flex">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
