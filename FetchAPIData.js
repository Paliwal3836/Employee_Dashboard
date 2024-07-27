const axios = require('axios');

// URL and token
const url = 'https://www.zohoapis.com/creator/v2.1/data/akshayorganics/planning-v2/report/Employee_with_Password_Form_Report';
const token = '1000.b8afa3628cfccd2068c52be38f86a54f.c43170b910a6e9658593fd6457862460';

// Fetch data function
async function fetchData() {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
         Accept: 'application/json'
      }
    });
    
    // Handle the response data
    console.log('Data fetched successfully:', response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Call the function
fetchData();
