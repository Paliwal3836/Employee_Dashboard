const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

let accessToken = '1000.a4e77feaafaf97d58d4736e6e42faea4.db592ff5076ab16d2245783178b09094'; // Store initial access token
let refreshToken = '1000.ebbc054ea1ca90363a3fd8e2bfb84d7e.421ada30fc4e6d1c85ff3972fa2f8e15'; // Store refresh token

const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
const apiUrl = 'https://www.zohoapis.com/creator/v2.1/data/akshayorganics/planning-v2/report/Employee_with_Password_Form_Report';

async function fetchNewAccessToken() {
  try {
    const response = await axios.post(tokenUrl, null, {
      params: {
        refresh_token: refreshToken,
        client_id: '1000.HYTN92YHOZXFOR139PNFQYERDEGRZQ',
        client_secret: '710b13ec8c2293cb91efa836124f1b277172708890',
        grant_type: 'refresh_token'
      }
    });
    accessToken = response.data.access_token;
    console.log('New access token fetched successfully:', accessToken);
  } catch (error) {
    console.error('Error fetching new access token:', error.response ? error.response.data : error.message);
  }
}

async function fetchData() {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);

    if (error.response && error.response.status === 401) {
      console.log('Access token expired, fetching new one...');
      await fetchNewAccessToken();
      return fetchData(); // Retry fetching data with the new token
    }

    return null;
  }
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/validate', async (req, res) => {
  const { name, password } = req.body;

  try {
    const data = await fetchData();

    if (data && data.data) {
      console.log('Fetched Data:', data.data); // Log fetched data
      console.log('Received Credentials:', { name, password }); // Log received credentials

      // Normalize the input to prevent issues with case sensitivity or whitespace
      const trimmedName = name.trim();
      const trimmedPassword = password.trim();

      // Adding logs to see each comparison
      const isValid = data.data.some(user => {
        const fetchedName = user.Employee_Name.trim();
        const fetchedPassword = user.Password.trim();

        const nameMatch = fetchedName === trimmedName;
        const passwordMatch = fetchedPassword === trimmedPassword;

        console.log(`Comparing with ${fetchedName}, ${fetchedPassword}`);
        console.log(`Name Match: ${nameMatch}, Password Match: ${passwordMatch}`);

        return nameMatch && passwordMatch;
      });

      if (isValid) {
        res.json({ status: 'success' });
      } else {
        res.json({ status: 'error', message: 'Incorrect Password' });
      }
    } else {
      res.status(500).json({ status: 'error', message: 'Failed to fetch data for validation.' });
    }
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
