import React, { useState } from 'react'
import Navbar from '../../components/navbar/Navbar';
import DatePicker from 'react-datepicker'; // a plugin!
import 'react-datepicker/dist/react-datepicker.css';
import { url } from "../../utils/constants";
import axios from 'axios';
import './event_create.css'

import { useNavigate } from 'react-router-dom';

const Event_create = () => {

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [etype, setType] = useState('Concert');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [brief_desc, setBrief_desc] = useState('');
  const [desc, setDesc] = useState('');
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [column, setColumn] = useState('');
  const [row, setRow] = useState('');
  const host = localStorage.getItem('username')

  const navigate = useNavigate();
  const [banner, setBanner] = useState('')
  const [search, setSearch] = useState('')
  const [seatmap, setSeatmap] = useState('')

  const selectSearch = e => {
    setSearch(e.target.files[0])
  }

  const selectBanner = e => {
    setBanner(e.target.files[0])
  }

  const selectSeatmap = e => {
    setSeatmap(e.target.files[0])
  }

  const createEvent = () => {
    const body = { title, location, etype, start, end, brief_desc, desc, host, seats, price, column, row }
    const headers = { 
      'Content-Type': 'application/json',
    }
    
    axios.post(url + "/event_create", body, { headers })
      .then((response) => {
        const data = response.data;
        uploadPhoto(data)
      })
      .catch((err) => {})

  }

  const uploadPhoto = (e_id) => {
    const fd = new FormData()
    if (search) {
      fd.append('search', search, "search" + e_id + ".jpg")
    }
    if (banner) {
      fd.append('banner', banner, "banner" + e_id + ".jpg")
    }
    if (seatmap) {
      fd.append('seatmap', seatmap, "seatmap" + e_id + ".jpg")
    }
    axios({
      method: "POST",
      url: url + "/upload_photo",
      data: fd,
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      const data = response.data;
      navigate("/event/" + e_id);
    })
    .catch((err) => {})
  }

  return (
    <div>
      <h1 className="host-an-event">HOST AN EVENT</h1>
      <div className="event-container">
        <div className="background-box">
          <div className='event-input'>
            <h2>BASIC INFORMATION</h2>
            <label>Event Title:</label>
            <input
              value={title}
              placeholder='Name of event'
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Event Location:</label>
            <input
              value={location}
              placeholder='Location'
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Event Type:</label>
            <select value={etype} onChange={e=>setType(e.target.value)} className ="custom-input">
              <option>Concert</option>
              <option>Dinner</option>
              <option>Festival</option>
              <option>Networking</option>
              <option>Party</option>
              <option>Seminar</option>
              <option>Sport</option>
              <option>Other</option>
            </select>
          </div>
          <div className='event-input'>
            <label>Seat Capacity:</label>
            <input
              value={seats}
              placeholder='Seat Capacity'
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Price:</label>
            <input
              value={price}
              placeholder='Price Of Ticket'
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
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
          <br/>
          <br/>
          <br/>
          <div className='event-input'>
            <h2>DATE AND TIME</h2>
            <br/>
            <label>Event Start:</label>
            <DatePicker
              showTimeSelect
              selected={start}
              onChange={start => setStart(start)}
              dateFormat="MMMM d, yyyy h:mmaa"
            />
          </div>
          <div className='event-input'>
            <label>Event End:</label>
            <DatePicker
              showTimeSelect
              selected={end}
              onChange={end => setEnd(end)}
              dateFormat="MMMM d, yyyy h:mmaa"
            />
          </div>
          <br/>
          <h2>EVENT DESCRIPTION</h2>
          <br/>
          <div className= 'event-input'>
            <label>Search description:</label>
            <input 
              type="text" 
              value={brief_desc}
              placeholder='Describe your event briefly'
              onChange={(e) => setBrief_desc(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Full description:</label>
            <br/>
            <textarea 
              rows={10} cols={100}
              value={desc}
              placeholder='Tell us more about your event!'
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <br/>
          <h2>EVENT GALLERY</h2>
          <h4>(This feature is optional. Stock photos will be used if left blank)</h4>
          <div className='event-input'>
            <label>Select a banner photo:</label>
            <br/>
            <input
              type = "file"
              onChange={selectBanner}
            />
          </div>

          <div className='event-input'>
            <label>Select a search photo:</label>
            <br/>
            <input
              type = "file"
              onChange={selectSearch}
            />
          </div>

          <div className='event-input'>
            <label>Select a seat map photo:</label>
            <br/>
            <input
              type = "file"
              onChange={selectSeatmap}
            />
          </div>
          <br/>
          <button type="button" onClick={createEvent}>Create</button>
        </div>
      </div>
    </div>
  )
}

export default Event_create;