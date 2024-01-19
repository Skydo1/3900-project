import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from "../../utils/constants";
import '../Booking.css'
import './profile.css'

const Profile_page = () => {

  const navigate = useNavigate();

  const username = useParams().username;

  const [data, setData] = useState([]);
  const [hosted, setHosted] = useState([]);
  const [isUser, setisUser] = useState([]);

  const body = { username };
  const headers = { 
    'Content-Type': 'application/json',
  }

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/api/user_details", body, { headers })
      .then((response) => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user details', error);
      })
  });

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/hosted_list", body, { headers })
      .then((response) => {
        setHosted(response.data);
      })
      .catch(error => {
        console.error('Error fetching host details', error);
      })
  });

  const token = localStorage.getItem('token')

  const body1 = { token, username };

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/api/authorize_user", body1, { headers })
      .then((response) => {
        setisUser(response.data)
      })
      .catch(error => {
        console.error('Error fetching details', error);
      })
  });

  const cancel_host = (e_id) => {
    axios.post(url + "/cancel_host", { token, e_id }, { headers })
      .then((response) => {
        window.location.reload();
      })
      .catch(error => {
        console.error('Error cancel hosted event', error);
      });
  }

  const edit_user = () => {
    navigate('/profile_edit');
  }

  return (
    <div>
      <br/>
      <div className='Auth'>
        <h1>Profile of {username}</h1>
      </div>
      <div className = 'user-container'>
        <div className='background-box'>
          <h3>Username: {username}</h3>
          <h3>Email: {data.email}</h3>
          {!isUser?
            <div></div>
          : <div style={{ flex: 0 }}>
              <h3>Coins: ${data.coins}</h3>
              <button type="button" onClick={() => edit_user()}>Edit Details & Top Up</button>
            </div>
          }
        </div>
      </div>
      <br/>
      <br/>
      <br/>
      <div className='top_bar'>
        <h1 className ='top-title'>EVENTS BY {username}</h1>
      </div>
      <ul>
        {hosted.map((item) => (
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
                {!isUser?
                  <div></div>
                : <div style={{ flex: 0 }}>
                    <button type="button" className='cancel-button' onClick={() => cancel_host(item.e_id)}>CANCEL</button>
                  </div>
                }
              </div>
            </div>
          </div>
        ))}
      </ul>
    </div>
  )
}

export default Profile_page
