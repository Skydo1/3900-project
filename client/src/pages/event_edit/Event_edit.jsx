import React, { useState } from 'react'
import DatePicker from 'react-datepicker'; // a plugin!
import 'react-datepicker/dist/react-datepicker.css';
import { url } from "../../utils/constants";
import axios from 'axios';
import './event_edit.css'
import { toast } from 'react-toastify';

import { useNavigate, useParams } from 'react-router-dom';

const Event_edit = () => {
  const e_id = useParams().id;
  const [data, setData] = useState("");

  const body = { e_id };
  const headers = { 
    'Content-Type': 'application/json',
  }

  const navigate = useNavigate();

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/api/event_details", body, { headers })
      .then((response) => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
  });

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [etype, setType] = useState('Concert');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [brief_desc, setBrief_desc] = useState('');
  const [desc, setDesc] = useState('');


  const token = localStorage.getItem('token')
  const [banner, setBanner] = useState('')
  const [search, setSearch] = useState('')

  const selectSearch = e => {
    setSearch(e.target.files[0])
  }

  const selectBanner = e => {
    setBanner(e.target.files[0])
  }

  const editEvent = () => {
    const body = { token, e_id ,title, location, etype, start, end, brief_desc, desc }
    const headers = { 
      'Content-Type': 'application/json',
    }
    
    axios.post(url + "/event_edit", body, { headers })
      .then((response) => {
        toast.success('Successfully edited details')
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
      <h1 className="host-an-event">EDIT EVENT DETAILS</h1>
      <div className="event-container">
        <div className="background-box">
          <div className='event-input'>
            <h2>BASIC INFORMATION</h2>
            <label>Event Title:</label>
            <input
              value={title}
              placeholder={data.title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Event Location:</label>
            <input
              value={location}
              placeholder={data.location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Event Type:</label>
            <select value={etype} onChange={e=>setType(e.target.value)} className ="custom-input">
              <option>Concert</option>
              <option>Dinner</option>
              <option>Festival</option>
              <option>Networking/Gathering</option>
              <option>Party</option>
              <option>Seminar/Talk</option>
              <option>Sport</option>
              <option>Other</option>
            </select>
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
              placeholder={data.brief_desc}
              onChange={(e) => setBrief_desc(e.target.value)}
            />
          </div>
          <div className='event-input'>
            <label>Full description:</label>
            <br/>
            <textarea 
              rows={10} cols={100}
              value={desc}
              placeholder={data.desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <br/>
          <h2>EVENT GALLERY</h2>
          <h4>(This feature is optional. Stock photos will be used if left blank)</h4>
          <div className='event-input'>
            <label>Select a banner photo (1x1):</label>
            <br/>
            <input
              type = "file"
              onChange={selectBanner}
            />
          </div>

          <div className='event-input'>
            <label>Select a search photo (1x1):</label>
            <br/>
            <input
              type = "file"
              onChange={selectSearch}
            />
          </div>
          <br/>
          <button type="button" onClick={editEvent}>Edit</button>
        </div>
      </div>
    </div>
  )
}

export default Event_edit;
