// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import SignIn from './pages/SignIn.jsx';
import Dashboard from './pages/Dashboard';

const Sidebar = () => (
  <div className="bg-asante-blue text-white w-60 h-screen flex flex-col">
    <div className="p-6 flex justify-center">
      <img src="/asante-logo.png" alt="Asante" className="h-14" />
    </div>
    <nav className="flex-1 px-4 py-4">
      <Link
        to="/"
        className="flex items-center p-3 rounded hover:bg-blue-600 mb-2 bg-blue-700"
      >
        {/* icon omitted for brevity */}
        New Customer Sign Up
      </Link>

      <Link
        to="/signin"
        className="flex items-center p-3 rounded hover:bg-blue-600 mb-2 bg-green-600"
      >
        {/* icon omitted for brevity */}
        Existing Customer Sign In
      </Link>
    </nav>
  </div>
);

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
