import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import CategoriesPage from './pages/CategoriesPage'
import AIPage from './pages/AIPage'

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: 220,
        flex: 1,
        padding: '36px 40px',
        maxWidth: 1200,
        width: '100%',
      }}>
        <Routes>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories"   element={<CategoriesPage />} />
          <Route path="/ai"           element={<AIPage />} />
        </Routes>
      </main>
    </div>
  )
}
