import React, { useState } from 'react'
import '../Auth.css'
import { url } from "../../utils/constants";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
  }

  const navigate = useNavigate();

  const loginUser = () => {
    const body = { email, password }
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + "/login", body, { headers })
      .then((response) => {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('username', response.data.username)
        navigate("/")
      })
      .catch((err) => {})

  }

  return (
    <div>
      <div className='Auth'>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className='Login'>
            <label for='email'>Email:</label>
            <input
              type="email"
              value={email}
              placeholder='youremail@mail.com'
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='Login'>
            <label for='password'>Password:</label>
            <input
              type="password"
              value={password}
              placeholder='1234Ab/.+'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className='link_reset'>
          <a href='/verification'>Reset Password</a>
            </button>
          <button type="button" onClick={loginUser}>Login</button>
          <button className='link_btn'>
            <a href='/register'>Sign up</a>
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login;
