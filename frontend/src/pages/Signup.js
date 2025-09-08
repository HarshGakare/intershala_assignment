import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';

export default function Signup({ setUser }) {
    const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
  e.preventDefault();
  try {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

 
    localStorage.setItem('token', res.token);

    
    setUser(res.user);

    
    console.log('Signed up user name:', res.user.name);

    navigate('/');
  } catch (err) {
    console.error('Signup failed:', err);
    alert('Signup failed. Please try again.');
  }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={submit}
        className="auth bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Signup</h2>
 <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-2 rounded transition"
        >
          Signup
        </button>

        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 underline hover:text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
