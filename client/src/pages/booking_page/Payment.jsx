import React, { useState, useEffect } from 'react';
import { url } from "../../utils/constants";
import axios from 'axios';
import '../Auth.css';
import '../Booking.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const [data, setData] = useState({
    title: "",
    location: "",
    start: "",
    brief_desc: "",
    price: 0,
  });

  const [details, setDetails] = useState({
    coins: 0,
  });

  const e_id = useParams().id;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [column, setColumn] = useState('');
  const [row, setRow] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const visiting_username = localStorage.getItem('username');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        const response = await axios.post(url + "/api/event_details", { e_id }, { headers });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching event details', error);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        const body = { username: visiting_username };
        const response = await axios.post(url + "/api/user_details", body, { headers });
        setDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details', error);
      }
    };

    fetchEventDetails();
    fetchUserDetails();
  }, [e_id, visiting_username]);

  const buyTicket = () => {
    const body2 = { token, e_id, email, name, phoneNum, column, row };
    const headers = { 'Content-Type': 'application/json' };
    axios.post(url + "/get_ticket", body2, { headers })
      .then((response) => {
        if (response.data.has_joined_waitlist === '0') {
          navigate("/booking_list");
        } else {
          navigate("/waitlist_notification");
        }
      })
      .catch(error => {
        console.error('Error fetching booking detail', error);
      });
  };

  const start = new Date(data.start).toString().replace(/ *\([^)]*\) */g, "");


  return (
    <div>
      <br/>
      <br/>
      <div className='top_bar'>
        <h1 className ='top-title'>BUY THE TICKET</h1>
      </div>
        <div className="container">
          <h2 style={{ fontFamily: '"Arial", sans-serif', fontSize: '25px' }}>ORDER SUMMARY</h2>
          <div className='payment-container'>
            <h2 className='small-bar'>Title: {data.title}</h2>
            <h3>Location: {data.location}</h3>
            <h3>Date: {start}</h3>
            <h3>description: {data.brief_desc}</h3>
          </div>
          <br/>
          <div style={{ display: 'flex', marginLeft: '30px' }}>
            <div className='event-input'>
              <label>Seat Column:</label>
              <input
                value={column}
                placeholder='input seat column'
                onChange={(e) => setColumn(e.target.value)}
              />
            </div>
            <div className='event-input'>
              <label>Seat Row:</label>
              <input
                value={row}
                placeholder='input seat row'
                onChange={(e) => setRow(e.target.value)}
              />
            </div>
          </div>
          <br/>
          <div style={{borderTop: '1px solid #aaa', width: '700px'}}></div>
          <h2>CURRENT BALANCE</h2>
          <h2 style={{marginLeft: '75vh'}}>${parseInt(details.coins).toFixed(2)}</h2>
          <h2>TOTAL</h2>
          <h2 style={{marginLeft: '75vh', color: 'red'}}>-${parseInt(data.price).toFixed(2)}</h2>
          <h3>Balance at the end of this will be: ${(parseInt(details.coins) - parseInt(data.price)).toFixed(2)}</h3>
            <br/>
                <button type="button" className='pay-button' onClick={buyTicket}>CONTINUE</button>
        </div>
      <br/>
    </div>
  )
}

export default Payment;