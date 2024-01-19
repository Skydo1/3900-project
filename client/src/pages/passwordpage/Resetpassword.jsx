import React, { useState } from 'react'
import '../Auth.css'
import { url } from "../../utils/constants";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Resetpassword = () => {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const handleSubmit = (event) => {
  event.preventDefault();
  }
  const navigate = useNavigate();

  const newPassword = () => {
      const token = localStorage.getItem('token');   
      if (token) {
        const body = { token, password, password2 }
        const headers = { 
          'Content-Type': 'application/json', 
        }
        axios.post(url + "/resetpassword", body, { headers })
          .then((response) => {
              const data = response.data;
              navigate("/");
          })
          .catch((err) => {})
      }
  }

  return (
    <div className='password-container'>
      <h1>Reset Password</h1>
      <div className='password-container'>
        <div className='background-box'>
          <form onSubmit={handleSubmit}>
            <div className='password-form'>
              <label for='password'>New Password:</label>
              <input
                type="password"
                value={password}
                placeholder='1234Ab/.+'
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='password-form'>
              <label for='password2'>Confirm Password:</label>
              <input
                type="password"
                value={password2}
                placeholder='1234Ab/.+'
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
            <button type="button" onClick={newPassword}>Reset</button>
          </form>
        </div>
      </div>
    </div>
)}


export default Resetpassword;