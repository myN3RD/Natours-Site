/* eslint-disable */
// import { showAlert } from './alerts';
// import axios from 'axios';



// ❌❌❌ LOGIN  AXIOS REFERENCE
// const login = async(email, password) => { // FIXME: AXIOS ERR
//   // console.log(axios); 

//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:8000/api/v1/users/login', // TODO: ->change to https when rdy
//       data: {
//         email,
//         password
//       }
//       });

//         console.log(res);

//         // if (res.data.status === 'success') {
//         //   showAlert('success', 'Logged in successfully');
//         //   window.setTimeout(() => {
//         //         location.assign('/');
//         //       }, 1500);
//         //   }
//     } catch (err) {
//     if(err.response && err.response.data) {
//       showAlert('error', err.response.data.message);
//       } else {
//         console.log('Error occurred:', err);
//         console.log('Error occurred:', err.response.data);
//       };
//     }
//   };


  // ✅✅✅ FETCH     OWN
  const login = async (email, password) => {
    try {
      // Perform the POST request using fetch
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/login', { // Change to HTTPS when ready
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify JSON data
        },
        body: JSON.stringify({ email, password }), // Convert data to JSON string
      });
  
      // Parse the response JSON
      const data = await res.json();
  
      // Check if the response was successful
      if (res.ok) {
        console.log('Login successful:', data);
  
        // Uncomment the following if success handling is needed
        // showAlert('success', 'Logged in successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);

        // Store the token
      localStorage.setItem('token', data.token);

        // Store the token in a secure cookie
        document.cookie = `token=${data.token}; Secure; SameSite=Strict; Path=/; Max-Age=3600`;


      } else {
        // If the response was not successful, handle errors
        console.error('Login failed: - Error:', data.message);
        // showAlert('error', data.message);
      }
    } catch (err) {
      // Catch and handle any other errors
      console.error('Error occurred during login:', err);
    }
  };
  


// ✅✅✅ LOGIN TESTING
// const login = (email, password) => {
//   console.log('LOGIN TESTING function', email, password);
//   alert(email, password);
// };


// NOTE only to see in google console when logging in
document.querySelector('.form').addEventListener('submit', e => {
  console.log('HELLO from queryselector..')
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('login_index.js , LOGIN BUTTON PRESSED in FE', email, password);
  login(email, password);
});


// LOGOUT
// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:8000/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };



21.11 ____________________

/* eslint-disable */
import { showAlert } from './alerts.js';
// import axios from 'axios';



// ❌❌❌ LOGIN  AXIOS REFERENCE
// const login = async(email, password) => { // FIXME: AXIOS ERR
//   // console.log(axios); 

//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:8000/api/v1/users/login', // TODO: ->change to https when rdy
//       data: {
//         email,
//         password
//       }
//       });

//         console.log(res);

//         // if (res.data.status === 'success') {
//         //   showAlert('success', 'Logged in successfully');
//         //   window.setTimeout(() => {
//         //         location.assign('/');
//         //       }, 1500);
//         //   }
//     } catch (err) {
//     if(err.response && err.response.data) {
//       showAlert('error', err.response.data.message);
//       } else {
//         console.log('Error occurred:', err);
//         console.log('Error occurred:', err.response.data);
//       };
//     }
//   };


  // ✅✅✅ FETCH     OWN
  const login = async (email, password) => {
    try {
      // Perform the POST request using fetch
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/login', { // Change to HTTPS when ready
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify JSON data
        },
        body: JSON.stringify({ email, password }), // Convert data to JSON string
      });
  
      // Parse the response JSON
      const data = await res.json();
  
      // Check if the response was successful
      if (res.ok) {
        console.log('Login successful:', data); // FIXME: maybe to sensitive data !??! FAB fragen
  
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);

        // Store the token
      localStorage.setItem('token', data.token);

        // Store the token in a secure cookie
        document.cookie = `token=${data.token}; Secure; SameSite=Strict; Path=/; Max-Age=3600`;


      // If errors
      } else {
        console.error('Login failed: - Error:', data.message);
        showAlert('error', data.message);
      }
    } catch (err) {
      console.error('Error occurred during login:', err);
    }
  };
  


// ✅✅✅ LOGIN -> FOR TESTING ONLY
// const login = (email, password) => {
//   console.log('LOGIN TESTING function', email, password);
//   alert(email, password);
// };


// NOTE only to see in google console when logging in
document.querySelector('.form').addEventListener('submit', e => {
  console.log('HELLO from queryselector..')
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('login_index.js , LOGIN BUTTON PRESSED in FE', email, password);
  login(email, password);
});


// LOGOUT
// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: 'GET',
//       url: 'http://127.0.0.1:8000/api/v1/users/logout'
//     });
//     if ((res.data.status = 'success')) location.reload(true);
//   } catch (err) {
//     console.log(err.response);
//     showAlert('error', 'Error logging out! Try again.');
//   }
// };




28.11 ____________________

/* eslint-disable */
import { showAlert } from './alerts.js';
// import axios from 'axios';



// ❌❌❌ LOGIN  AXIOS REFERENCE
// const login = async(email, password) => { // FIXME: AXIOS ERR
//   // console.log(axios); 

//   try {
//     const res = await axios({
//       method: 'POST',
//       url: 'http://127.0.0.1:8000/api/v1/users/login', // TODO: ->change to https when rdy
//       data: {
//         email,
//         password
//       }
//       });

//         console.log(res);

//         // if (res.data.status === 'success') {
//         //   showAlert('success', 'Logged in successfully');
//         //   window.setTimeout(() => {
//         //         location.assign('/');
//         //       }, 1500);
//         //   }
//     } catch (err) {
//     if(err.response && err.response.data) {
//       showAlert('error', err.response.data.message);
//       } else {
//         console.log('Error occurred:', err);
//         console.log('Error occurred:', err.response.data);
//       };
//     }
//   };


  // ✅✅✅ FETCH     OWN
  const login = async (email, password) => {
    try {
      // Perform the POST request using fetch
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/login', { // Change to HTTPS when ready
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify JSON data
        },
        body: JSON.stringify({ email, password }), // Convert data to JSON string
      });
  
      // Parse the response JSON
      const data = await res.json();
  
      // Check if the response was successful
      if (res.ok) {
        console.log('Login successful:', data); // FIXME: maybe to sensitive data !??! FAB fragen
  
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);

        // Store the token
        localStorage.setItem('jwt', data.token);

        // Store the token in a secure cookie
        document.cookie = `jwt=${data.token}; Secure; SameSite=Strict; Path=/; Max-Age=3600`;


      // If errors
      } else {
        console.error('Login failed: - Error:', data.message);
        showAlert('error', data.message);
      }
    } catch (err) {
      console.error('Error occurred during login:', err);
    }
  };
  


// ✅✅✅ LOGIN -> FOR TESTING ONLY
// const login = (email, password) => {
//   console.log('LOGIN TESTING function', email, password);
//   alert(email, password);
// };



//  THIS IS NOT NESCCESSARY ?!?!??!!? -> MAKES "ERROR"
// NOTE only to see in google console when logging in
document.querySelector('.form').addEventListener('submit', e => {
  console.log('HELLO from queryselector..')
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('login_index.js , LOGIN BUTTON PRESSED in FE', email, password);
  login(email, password);
});






// ✅✅✅ NEW
const logOutBtn = document.querySelector('.nav__el--logout');

const logout = async () => {
  try {
    // Perform the GET request using fetch
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    // Check if the response status is okay
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Logout failed');
    }

    // Parse the response JSON
    const data = await res.json();

    if (data.status === 'success') {
      // Reload the page
      location.reload(); // Reload without using `true` (deprecated)
    } else {
      throw new Error(data.message || 'Logout failed');
    }
  } catch (err) {
    console.error('Error logging out:', err);
    if (typeof showAlert === 'function') {
      showAlert('error', 'Error logging out! Try again.');
    }
  }
};


// Attach event listener to the logout button
if (logOutBtn) {
  logOutBtn.addEventListener('click', () => {
    console.log('Logout button clicked');
    logout();
  });
};
