const axios = require('axios');
const cheerio = require('cheerio');
const Event = require('../Models/Events'); // Adjust the path as necessary

async function scrapeEvents(req, res) {
    const email = process.env.SCARPPER_MAIL;
    const password = process.env.SCARPPER_PASWRD;
    const loginUrl = 'https://business.fatsoma.com/api/authentications/basic.json'; // Updated login URL
    const dataUrl = 'https://business.fatsoma.com/business/products/events'; // Ensure this URL is correct too

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
            withCredentials: true, // Ensures that cookies are stored
        });

        // Check if login was successful
        if (loginResponse.status !== 201) {
            throw new Error('Login failed: ' + loginResponse.statusText);
        }

        // Extract cookies from login response
        const cookies = loginResponse.headers['set-cookie'];
        if (!cookies) {
            throw new Error('No cookies set during login');
        }

        const cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');

        // Use the cookies in the request to fetch event data
        const response = await axios.get(dataUrl, {
            headers: {
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);
        const events = [];

        // Adjust the class names according to the actual structure of the page
        $('.event-class').each(async (index, element) => {
            const title = $(element).find('.ember-view').text().trim();
            const date = $(element).find('.date-class').text().trim();
            const venue = $(element).find('.venue-class').text().trim();

            if (title && date && venue) {
                const newEvent = new Event({ title, date, venue });
                await newEvent.save();
                events.push(newEvent);
            }
        });

        res.json({ success: true, data: events });
    } catch (error) {
        console.error('Error scraping events:', error);
        res.status(500).json({ success: false, message: 'Error scraping data', error: error.message });
    }
}

module.exports = {
    scrapeEvents,
};
