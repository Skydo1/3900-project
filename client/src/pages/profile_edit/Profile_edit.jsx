import React, { useState } from 'react'
import '../Auth.css'
import { url } from "../../utils/constants";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {loadStripe} from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (elements == null) {
      return;
    }

    // Trigger form validation and wallet collection
    const {error: submitError} = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret from your server endpoint
    const res = await fetch('/create-intent', {
      method: 'POST',
    });

    const {client_secret: clientSecret} = await res.json();

    const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      clientSecret,
      confirmParams: {
        return_url: '/profile_edit',
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || !elements}>
        Pay
      </button>
      {/* Show error message to your customers */}
    </form>
  );
};


const Profile_edit = () => {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [data, setData] = useState('');
  const [topup, setTopup] = useState(0);
  const [showpayment, setShowpayment] = useState(false)

  const visiting_username = localStorage.getItem('username')

  const body = { username: visiting_username };
  const headers = { 
    'Content-Type': 'application/json',
  }

  const options = {
    mode: 'payment',
    amount: 100,
    currency: 'usd',
    // Fully customizable with appearance API.
    appearance: {
      /*...*/
    },
  };

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
  const token = localStorage.getItem('token')

  const handleSubmit = (event) => {
    event.preventDefault();
  }

  const navigate = useNavigate();

  const editUser = () => {
    const body = { token, email, username }
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + "/edit_user", body, { headers })
      .then((response) => {
        localStorage.setItem('username', username)
        navigate("/profile/" + username)
      })
      .catch((err) => {})

  }

  function pay() {
    if (topup <= 0) {
      toast.error("Invalid top up amount")
    } else {
      options.amount = topup * 100
      setShowpayment(true)
    }
  }

  const topUp = () => {
    const body = { token, amount:topup }
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + "/top_up", body, { headers })
      .then((response) => {
        window.location.reload()
      })
      .catch((err) => {})

  }

  const stripePromise = loadStripe('pk_live_51NVVPhKNpn0aXgh2MWpEqFHs7bQESOyrPNKOYotC9VhinG1AMr7bAkWsZgdkF6txz68FtEDBPhRRJoeshOaoSC3f00Hin6B7GO');

  return (
    <div>
      <div className='Auth'>
        <h1>Edit User Details</h1>
        <div className='Auth'>
            <form onSubmit={handleSubmit}>
            <div className='Login'>
                <label>Email:</label>
                <input
                type="email"
                value={email}
                placeholder={data.email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className='Login'>
                <label for='username'>Username:</label>
                <input
                type="username"
                value={username}
                placeholder={data.username}
                onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <button className='link_reset'>
            <a href='/verification'>Reset Password</a>
                </button>
            <button type="button" onClick={editUser}>Edit Details</button>
            </form>
        </div>
        <h1>Top-up your coins</h1>
        <div className='Auth'>
          <h2>Current balance: ${data.coins}</h2>
          <div className='Auth'>
            {!showpayment?
              <div>
                <label>Top up amount: </label>
                <input
                    type="number"
                    value={topup}
                    placeholder='Enter an amount'
                    onChange={(e) => setTopup(parseInt(e.target.value))}
                />
                <button onClick={pay}>Proceed to payment</button>
              </div>
            :
            <div>
              <h2>Top up amount: ${topup.toFixed(2)}</h2>
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm />
              </Elements>
              <button type="button" className='pay-button' onClick={topUp}>CONTINUE</button>
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile_edit;
