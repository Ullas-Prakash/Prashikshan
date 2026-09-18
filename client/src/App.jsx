import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';

function Shell() {
  const location = useLocation();
  const isAuth = ['/login', '/register'].includes(location.pathname);
  return <div className="app-shell">{!isAuth && <Navbar />}<main><AppRoutes /></main></div>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><Shell /></AuthProvider></BrowserRouter>;
}
