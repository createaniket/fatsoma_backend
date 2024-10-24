// eventController.js
const axios = require('axios');
const cheerio = require('cheerio');
const Event = require('../Models/Events'); // Adjust the path as necessary

async function scrapeEvents(req, res) {
    const email = process.env.SCARPPER_MAIL;
    const password =  process.env.SCARPPER_PASWRD;
    const loginUrl = 'https://business.fatsoma.com/sign-in'; // Adjust this URL if necessary
    const dataUrl = 'https://business.fatsoma.com/business/products/events'; // The URL you want to scrape

  try {
    // Log in and store cookies
    const { data: loginPage } = await axios.get(loginUrl);

    const cookies = await axios({
      method: 'post',
      url: loginUrl,
      data: {
        email: email,
        password: password,
      },
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Use cookies in the request to fetch the data
    const response = await axios.get(dataUrl, {
      headers: {
        Cookie: cookies.headers['set-cookie'].join('; '),
      },
    });

    const $ = cheerio.load(response.data);
    const events = [];

    // Adjust the selectors based on the actual structure of the page
    $('.event-class').each(async (index, element) => {
      const title = $(element).find('.title-class').text();
      const date = $(element).find('.date-class').text();
      const venue = $(element).find('.venue-class').text();
      
      // Save the event to MongoDB
      const newEvent = new Event({ title, date, venue });
      await newEvent.save();
      events.push(newEvent); // Collecting saved events
    });
    
    res.json({ success: true, data: events }); // Send the scraped events as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error scraping data' });
  }
}

module.exports = {
  scrapeEvents,
};
