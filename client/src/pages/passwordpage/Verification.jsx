import React, { useState } from 'react'
import '../Auth.css'
import { url } from "../../utils/constants";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './password.css'

const Verification = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    }
    const navigate = useNavigate();

    const sendEmail = () => {
      const body = { email }
      const headers = { 
      'Content-Type': 'application/json',    
      }
    
      axios.post(url + "/sendemail", body, { headers })
          .then((response) => {
            toast.success('Email Sent!')
          })
          .catch((err) => {})
    }

    const verifyCode = () => {
        const body = { email, code }
        const headers = { 
        'Content-Type': 'application/json',    
        }
      
      axios.post(url + "/verification", body, { headers })
          .then((response) => {
              localStorage.setItem('token', response.data.token)
              localStorage.setItem('username', response.data.username)
              navigate("/resetpassword");
          })
          .catch((err) => {})
    }

  return (
    
    <div className='password-container'>
      <h1>Send a Verification Code</h1>
      <div className='password-container'>
        <div className='background-box'>
          <form onSubmit={handleSubmit}>
            <div className='password-form'>
              <label for='email'>Email:</label>
              <input
                type="email"
                value={email}
                placeholder='youremail@mail.com'
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="button" onClick={sendEmail}>Send Code to Email</button>
            </div>
          </form>
        </div>
        <br/>
        <div className='background-box'>
          <form onSubmit={handleSubmit}>
            <div className='password-form'>
              <label for='code'>Enter verification code:</label>
              <input
                type="code"
                value={code}
                placeholder='123456'
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button type="button" onClick={verifyCode}>Submit</button>
          </form>
        </div>
      </div>
      
    </div>

  )
}


export default Verification