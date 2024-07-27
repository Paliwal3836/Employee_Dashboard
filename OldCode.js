const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'https://www.zohoapis.com/creator/v2.1/data/akshayorganics/planning-v2/report/Employee_with_Password_Form_Report';
const token = '1000.1e197f84b334620b7869e8eed1acbc10.956006cb6fd8a5587cbb1c64bfa4e4eb';

async function fetchData() {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
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
                res.json({ status: 'error', message: 'Invalid credentials' });
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
