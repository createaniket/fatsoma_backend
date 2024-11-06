const axios = require('axios');

const baseUrl = 'https://business.fatsoma.com/api/business/companies/c7275d6b-ceb0-43fc-acbf-64ba6ddb91ae/daily_stats.json?currency=GBP';

// Function to fetch data from all pages
async function fetchAllData() {
    console.log("I have been called");
    let allData = [];
    const totalPages = 277; // Adjust based on the actual number of pages

    // Set your cookies here, combine them as a single string
    const cookies = '_fatsoma_sid=d863c9d918e4e91e0e81e29351b97291; _fatsoma_sid_production=f3609ce2-8af5-4946-89ae-64deece5d904;'; // Add more if needed

    for (let page = 1; page <= totalPages; page++) {
        try {
            console.log("Fetching page:", page);

            const response = await axios.get(`${baseUrl}&page=${page}`, {
                headers: {
                    'Cookie': cookies,
                    'x-fatsoma-time-zone': 'Asia/Kolkata',
                    'x-requested-with': 'XMLHttpRequest',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
                }
            });

            // Log the response data
            // console.log(`Data from page ${page}:`, JSON.stringify(response.data, null, 2));

            // Check if the response has the expected structure
            if (response.data.body) {
                allData = allData.concat(response.data.body);
            } else {
                console.warn(`No body data found for page ${page}`);
            }

        } catch (error) {
            console.error(`Failed to fetch page ${page}: ${error.message}`);
        }
    }

    return allData;
}

// Function to process the fetched data
const processData = (data) => {
    const structuredData = data.map(entry => ({
        date: new Date(entry.cells[0].data),
        sales: entry.cells[1].data,
        incentives: entry.cells[2].data,
        totalIn: entry.cells[3].data,
        totalOut: entry.cells[4].data,
        revenue: entry.cells[5].data,
        brands: entry.children.map(brand => ({
            brandName: brand.cells[0].data,
            sales: brand.cells[1].data,
            incentives: brand.cells[2].data,
            totalIn: brand.cells[3].data,
            totalOut: brand.cells[4].data,
            revenue: brand.cells[5].data,
            events: brand.children.map(event => ({
                eventName: event.cells[0].data,
                sales: event.cells[1].data,
                incentives: event.cells[2].data,
                totalIn: event.cells[3].data,
                totalOut: event.cells[4].data,
                revenue: event.cells[5].data,
            })),
        })),
    }));

    console.log("Aggregated Data:", JSON.stringify(structuredData, null, 2));
};

// Call the function and log the results
fetchAllData().then(allData => {
    // console.log("Fetched All Data:", allData);
    processData(allData);
}).catch(error => {
    console.error('Error fetching data:', error);
});
