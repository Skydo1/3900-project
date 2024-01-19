import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../Booking.css'

const WaitlistNotification= () => {
  const navigate = useNavigate();

  const handleButton = () => {
    navigate("/")
  }

  return (
    <div>
      <br/>
      <h2>
        The tickets are sold out. You are added into the waitlist! You will receive an email when you get the ticket!
      </h2>
      <div>
        <button type="button" className='go-home-button'  onClick={handleButton}>Go Home</button>
      </div>
      
    </div>
  )
}

export default WaitlistNotification;
