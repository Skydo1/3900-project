import React, { useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css';
import { url } from "../../utils/constants";
import axios from 'axios';
import '../Auth.css'
import '../Booking.css'


const Booking_manage = () => {
  const [data, setData] = useState([]);
  const token = localStorage.getItem('token')
  const body = { token }
  const headers = { 
    'Content-Type': 'application/json',
  }

  useState(() => {
    // Make an HTTP POST request to the backend API endpoint
    axios.post(url + "/booking_list", body, { headers })
      .then((response) => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching booking details', error);
      })
  });

  const cancel_booking = (e_id) => {
    axios.post(url + "/cancel_booking", { token, e_id }, { headers })
      .then((response) => {
        console.log(response.data)
        setData(response.data)

      })
      .catch(error => {
        console.error('Error cancel booking', error);
      });
  }

  return (
    <div>
      <br/>
      <br/>
      <div className='top_bar'>
        <h1 className ='top-title'>YOUR BOOKINGS</h1>
      </div>
        <ul>
        {data.map((item) => (
          <div key={item} style={{ display: 'grid', justifyContent: 'center' }}>
            <br/>
            <div className='booking-container'>
              <h2 className='small-bar'>
                <a href={"/event/" + item.e_id}>
                  Title: {item.title}
                  </a></h2>
              <div style={{ display: 'flex'}}>
                <div style={{ flex: 2 }}>
                  <h3>Location: {item.location}</h3>
                  <h3>Date: {(new Date(item.date).toString().replace(/ *\([^)]*\) */g, ""))}</h3>
                  <h3>Description: {item.des}</h3>
                </div>
                <div style={{ flex: 0 }}>
                  <button type="button" className='cancel-button' onClick={() => cancel_booking(item.e_id)}>CANCEL</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ul>
    </div>
  )
}
export default Booking_manage;