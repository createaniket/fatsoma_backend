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

        // Initialize an array to store all data across pages
        let page = 1;
        let totalPages;

        while (true) {
            console.log(`Fetching data from page ${page}`);
            const response = await axios.get(`${dataUrl}&page=${page}`, {
                headers: {
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
                },
            });

            const data = response.data;

            // Set totalPages only on the first request
            if (!totalPages) {
                totalPages = data.total_pages;
            }

            // Process the data for the current page
            const formattedData = data.body.map(eventEntry => {
                const cells = eventEntry.cells;
                const brands = eventEntry.children || [];

                return {
                    date: cells[0]?.data ? new Date(cells[0].data) : null,
                    sales: cells[1]?.data || 0,
                    incentives: cells[2]?.data || 0,
                    totalIn: cells[3]?.data || 0,
                    totalOut: cells[4]?.data || 0,
                    revenue: cells[5]?.data || 0,
                    brands: brands.map(brand => ({
                        brandName: brand.cells[0]?.data || '',
                        sales: brand.cells[1]?.data || 0,
                        incentives: brand.cells[2]?.data || 0,
                        totalIn: brand.cells[3]?.data || 0,
                        totalOut: brand.cells[4]?.data || 0,
                        revenue: brand.cells[5]?.data || 0,
                        events: (brand.children || []).map(event => ({
                            eventName: event.cells[0]?.data || '',
                            sales: event.cells[1]?.data || 0,
                            incentives: event.cells[2]?.data || 0,
                            totalIn: event.cells[3]?.data || 0,
                            totalOut: event.cells[4]?.data || 0,
                            revenue: event.cells[5]?.data || 0,
                        })),
                    })),
                };
            });

            // Insert each page's data into the database
            await Event.insertMany(formattedData);
            console.log(`Data from page ${page} saved successfully.`);

            // Break the loop if we've reached the last page
            if (page >= totalPages) {
                break;
            }

            // Move to the next page
            page++;
        }

        res.json({ success: true, message: "All pages data extracted and saved successfully." });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
}



async function updateBrandData(req, res) {

    console.log("jcnjfnveeenveklre")
    const brandId = req.params.id;
    const email = process.env.SCARPPER_MAIL;
    const password = process.env.SCARPPER_PASWRD;

    const loginUrl = 'https://business.fatsoma.com/api/authentications/basic.json';
    const dataUrl = `https://business.fatsoma.com/api/business/companies/${brandId}/daily_stats.json?currency=GBP`;

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

        // Get the most recent date from the database
        const latestEntry = await Event.findOne({}).sort({ date: -1 });
        const latestDate = latestEntry ? latestEntry.date : null;

        let currentPage = 1;
        const maxPages = 3; // Limit to only the first 3 pages
        const newEntries = [];

        while (currentPage <= maxPages) {
            const response = await axios.get(`${dataUrl}&page=${currentPage}`, {
                headers: {
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
                },
            });
            const { body } = response.data;

            // Process new entries that are after the latest stored date
            let shouldStop = false;
            body.forEach(entry => {
                const date = new Date(entry.cells[0]?.data);

                // Stop if the date is older or equal to the last stored date
                if (latestDate && date <= latestDate) {
                    shouldStop = true;
                    return;
                }

                const newEntry = {
                    date,
                    sales: entry.cells[1]?.data || 0,
                    incentives: entry.cells[2]?.data || 0,
                    totalIn: entry.cells[3]?.data || 0,
                    totalOut: entry.cells[4]?.data || 0,
                    revenue: entry.cells[5]?.data || 0,
                    brands: [
                        {
                            brandName: 'Bournemouth Freshers 2024',
                            sales: entry.cells[1]?.data || 0,
                            incentives: entry.cells[2]?.data || 0,
                            totalIn: entry.cells[3]?.data || 0,
                            totalOut: entry.cells[4]?.data || 0,
                            revenue: entry.cells[5]?.data || 0,
                            events: entry.events.map(event => ({
                                eventName: event.eventName,
                                sales: event.sales?.data || 0,
                                incentives: event.incentives?.data || 0,
                                totalIn: event.totalIn?.data || 0,
                                totalOut: event.totalOut?.data || 0,
                                revenue: event.revenue?.data || 0
                            }))
                        }
                    ]
                };
                newEntries.push(newEntry);
                console.log("newEntry", newEntry)
            });

            // Break if an older or equal date was found
            if (shouldStop) {
                break;
            }

            console.log("current", currentPage)
            // Move to the next page
            currentPage++;
        }

        // Save only new entries in the database
        if (newEntries.length > 0) {
            console.log("newEntriesnewEntriesnewEntries", newEntries)
            await Event.insertMany(newEntries);
        }

        res.json({
            success: true,
            message: `${newEntries.length} new entries added`,
            data: newEntries
        });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
    }
}



module.exports = {
    ExtractData,updateBrandData
};
