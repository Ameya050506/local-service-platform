import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';       // <-- NEW IMPORT
import Register from './pages/Register'; // <-- NEW IMPORT
import { ServiceProvider } from './context/ServiceContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />       {/* <-- NEW ROUTE */}
                <Route path="/register" element={<Register />} /> {/* <-- NEW ROUTE */}
              </Routes>
            </main>
          </div>
        </Router>
      </ServiceProvider>
    </AuthProvider>
  );
}

export default App;