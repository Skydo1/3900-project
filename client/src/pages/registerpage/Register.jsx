import React, { useState } from 'react';
import { url } from "../../utils/constants";
import axios from 'axios';
import '../Auth.css'
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
  }

  const navigate = useNavigate();

  const registerUser = () => {
    const body = { email, username, password, password2 }
    const headers = { 
      'Content-Type': 'application/json',
    }
    
    axios.post(url + "/register", body, { headers })
      .then((response) => {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('username', username)
        navigate("/");
      })
      .catch((err) => {})
  }
  
  return (
    <div>
      <div className='Auth'>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className='Register'>
            <label for='email'>Email:</label>
            <input
              type="email"
              value={email}
              placeholder='youremail@mail.com'
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='Register'>
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              placeholder='enter your username'
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className='Register'>
            <label for='password'>Password:</label>
            <input
              type="password"
              value={password}
              placeholder='1234Ab/.+'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='Register'>
            <label for='password2'>Confirm Password:</label>
            <input
              type="password"
              value={password2}
              placeholder='1234Ab/.+'
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
          <button type="button" onClick={registerUser}>Submit</button>
          <button className='link_btn'>
            <a href='/login'>Already have an account? Sign in</a>
          </button>
        </form>
      </div>
    </div>
  )
  
}

export default Register;
