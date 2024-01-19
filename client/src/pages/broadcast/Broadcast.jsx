import React, { useState } from 'react'
import { url } from "../../utils/constants";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const Broadcast = () => {

  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const token = localStorage.getItem('token')
  const e_id = useParams().id;

  const broadcastMessage = () => {
    const body = { token, e_id, message }
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + "/broadcast_message", body, { headers })
      .then((response) => {
        toast.success('Email Sent!')
        navigate("/event/" + e_id)
      })
      .catch((err) => {})

  }

  return (
    <div>
      <div className='Auth'>
        <h1>Broadcast a message</h1>
        <h2>notify your guests through email!</h2>
        <div className='event-input'>
            <label>Your message:</label>
            <br/>
            <textarea 
              rows={10} cols={100}
              value={message}
              placeholder='Dear guests, ...'
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        <button type="button" onClick={broadcastMessage}>Broadcast Message</button>
      </div>
    </div>
  )
}

export default Broadcast;
