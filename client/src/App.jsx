import { BrowserRouter, useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'

function Layout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/quiz'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}