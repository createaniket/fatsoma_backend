const axios = require('axios');
const Event = require('../Models/Events'); // Adjust the path as necessary

async function ExtractData(req, res) {
    const email = process.env.SCARPPER_MAIL;
    const password = process.env.SCARPPER_PASWRD;
    const loginUrl = 'https://business.fatsoma.com/api/authentications/basic.json';
    const dataUrl = 'https://business.fatsoma.com/api/business/companies/c7275d6b-ceb0-43fc-acbf-64ba6ddb91ae/daily_stats.json?currency=GBP';

    try {
        // Log in and store cookies
        const loginResponse = await axios.post(loginUrl, {
            email: email,
            password: password,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            },
            withCredentials: true,
        });

        // Check if login was successful
        if (loginResponse.status !== 201) {
            throw new Error('Login failed: ' + loginResponse.statusText);
        }

        // Extract cookies from login response
        const cookies = loginResponse.headers['set-cookie'];
        const cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');

        // Fetch data using the dynamic cookies
        const response = await axios.get(dataUrl, {
            headers: {
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            },
        });

        const events = [];
        const data = response.data;

        // Check if body exists and is an array
        if (data.body && Array.isArray(data.body)) {
            data.body.forEach(eventEntry => {
                const cells = eventEntry.cells; // Get the cells array
                if (cells && cells.length >= 5) { // Ensure there are enough cells
                    const date = cells[0]; // Date
                    const sales = cells[1]; // Sales
                    const incentive = cells[2]; // Incentives
                    const totalIn = cells[3]; // This is 'in' as per your note
                    const totalOut = cells[4]; // This should be 'out'
                    const revenue = cells[5]; // Assuming revenue is at index 5

                    // Log the extracted event data
                    console.log(`Extracted Event - Date: ${date}, Sales: ${sales}, Incentive: ${incentive}, Total In: ${totalIn}, Total Out: ${totalOut}, Revenue: ${revenue}`);

                    // Check that required data exists
                    if (date && totalIn !== undefined && totalOut !== undefined && revenue !== undefined) {
                        const newEvent = new Event({
                            eventName: date, // Using date as event name, adjust as needed
                            incentive,
                            totalIn,
                            totalOut,
                            revenue,
                        });

                        // Save the event to the database
                        events.push(newEvent);
                    }
                }
            });
        }

        // Wait for all save operations to complete
        await Promise.all(events);

        // Send the response after all events are saved
        res.json({ success: true, data: events });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
}

module.exports = {
    ExtractData,
};
