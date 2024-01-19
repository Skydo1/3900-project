import { Routes, Route } from "react-router-dom";
import Home from "./pages/homepage/Home";
import Login from "./pages/loginpage/Login";
import Event_create from "./pages/event_create/Event_create";
import Register from "./pages/registerpage/Register";
import Verification from "./pages/passwordpage/Verification";
import Resetpassword from "./pages/passwordpage/Resetpassword";
import Event_page from "./pages/event_page/Event_page";
import Profile_page from "./pages/profile_page/Profile_page";
import Event_edit from "./pages/event_edit/Event_edit";
import Search from "./pages/search_page/Search";
import Payment from "./pages/booking_page/Payment";
import Booking_manage from "./pages/booking_page/Booking_manage";
import Profile_edit from "./pages/profile_edit/Profile_edit";
import Broadcast from "./pages/broadcast/Broadcast";
import './axios';
import './App.css';
import Navbar from "./components/navbar/Navbar";
import WaitlistNotification from "./pages/booking_page/WaitlistNotification";
import Chatroom from "./pages/chatroom/Chatroom"
import Chatbot from "./components/chatbot/Chatbot";


function App() {

  return (
    <div>
      <Navbar/>
      <Chatbot />
      <Routes>
        <Route path = "/" element={<Home />} />
        <Route path = "/login" element={<Login />} />
        <Route path = "/register" element={<Register />} />
        <Route path = "/event_create" element={<Event_create />} />
        <Route path = "/event_edit/:id" element={<Event_edit />} />
        <Route path = "/verification" element={<Verification />} />
        <Route path = "/resetpassword" element={<Resetpassword />} />
        <Route path = "/event/:id" exact element={<Event_page />}/>
        <Route path = "/broadcast/:id" exact element={<Broadcast />}/>
        <Route path = "/profile/:username" exact element={<Profile_page />}/>
        <Route path = "/search" element={<Search />}/>
        <Route path = "/get_ticket" exact element={<Payment />}/>
        <Route path = "/buy_ticket/:id" exact element={<Payment />}/>
        <Route path = "/booking_list" exact element={<Booking_manage />}/>
        <Route path = "/profile_edit" exact element={<Profile_edit />}/>
        <Route path = "/waitlist_notification" exact element={<WaitlistNotification />}/>
        <Route path = "/chatroom" exact element={<Chatroom />}/>
      </Routes>
    </div>
  );
}

export default App;
