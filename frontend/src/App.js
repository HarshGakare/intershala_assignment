import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Listings from './pages/Listings';
import CartPage from './pages/CartPage';

function Nav({ user, setUser }) {
  const navigate = useNavigate();
   const [cartCount, setCartCount] = useState(0);


useEffect(() => {
    function updateCartCount() {
      if (user) {
        fetch((process.env.REACT_APP_API_URL || "http://localhost:4000") + "/cart")
          .then((res) => res.json())
          .then((data) => {
            const total = data.items.reduce((sum, i) => sum + i.qty, 0);
            setCartCount(total);
          })
          .catch(() => setCartCount(0));
      } else {
        const local = JSON.parse(localStorage.getItem("localCart") || "[]");
        const total = local.reduce((sum, i) => sum + i.qty, 0);
        setCartCount(total);
      }
    }

    updateCartCount();

    
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, [user]);

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-6">
        <Link to="/" className="font-bold text-lg hover:text-yellow-400 transition">
          Home
        </Link>
        <Link to="/cart" className="hover:text-yellow-400 transition">
          Cart
        </Link>
      </div>

      <div>
        {user ? (
          <span className="flex items-center space-x-3">
            <span>Hello, <span className="font-semibold">{user.name}</span></span>
            <button
              onClick={logout}
              className="bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 transition"
            >
              Logout
            </button>
          </span>
        ) : (
          <Link
            to="/login"
            className="bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}


export default function App(){
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token){
      try{
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, email: payload.email });
      }catch(e){}
    }
  },[]);

  return (
    <BrowserRouter>
      <Nav user={user} setUser={setUser} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Listings user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/cart" element={<CartPage user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
