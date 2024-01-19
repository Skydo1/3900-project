import React from 'react';
import './navbar.css';
import images from "../../images/dropdown.png";
import { url } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Navbar = () => {

  const navigate = useNavigate();

  function logout() {
    axios({
        method: "POST",
        url: url + "/logout",
    })
    .then((response) => {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      
      navigate('/');
      window.location.reload()
    }).catch((error) => {})
  }

  const logged = localStorage.getItem('username');

  function profile() {
    navigate("/profile/" + logged)
  }

  return (
    <div className="navbar">
      <a href="/" className="navbar-logo">Whatevent</a>
      <div className="navbar-menu">
        <a href="/" className="navbar-item">Home</a>
        <a href="/search" className="navbar-item">Search</a>
    {/* {logged && <a href="/profile" className="navbar-item">{logged}</a>} */}
        <div className="dropdown">
          <button className="navbar-dropdown">Organise</button>
          {!logged?
            <div className="dropdown-content">
              <a href="/login">Host an event</a>
              <a href="/login">View bookings</a>
              <a href="/login">Chatroom</a>
            </div>
            :<div className="dropdown-content">
              <a href="/event_create">Host an event</a>
              <a href="/booking_list">View bookings</a>
              < a href="/chatroom">Chatroom</a>
            </div>
          }
        </div>
        <img
          src={images} alt="images"
          className="navbar-arrow"/> 
        {!logged?
          <div className="auth">
            <a href="/login" className="navbar-item">Login</a>
            <a href="/register" className="navbar-item">Register</a>
          </div>
          :<div className="auth">
            <a className="navbar-item" onClick={logout}>Logout</a>
            <a className="navbar-item" onClick={profile}>{logged}</a>
          </div>
        } 
      </div>
    </div>
  );
};

export default Navbar;