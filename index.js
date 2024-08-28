// Import required modules
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser'); // Require body-parser for parsing POST request body
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');

require('dotenv').config();

// Set up view engine and static files
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware for parsing POST request body

// Set up session
const session = require('express-session');
app.use(session({
    secret: 'thisIsJustDumb',
    saveUninitialized: false,
    resave: false   // This is like signing the cookie
}));

// Function to format a date as 'YYYY-MM-DD'
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Clone the date and add 10 days
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 10);
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}/${year}-${endMonth}-${endDay}`;
};

// Function to get the current date and time formatted
function getCurrentDateTimeFormatted() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Define route for the homepage
app.get("/", async (req, res) => {
    try {
        // Get the city from the session or use a default value ("Dehradun")
        let { city } = req.session;
        if (!city) {
            city = "Dehradun";
            req.session.city = city; // Set the default city in the session
        }

        // Format the current date
        const currentDate = new Date();
        const formattedCurrentDate = formatDate(currentDate);

        // API Key for VisualCrossing API
        const key = process.env.API_KEY;

        // Create the API endpoint for fetching weather data
        let endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${formattedCurrentDate}?key=${key}&unitGroup=metric&elements=tempmax,tempmin,temp,sunrise,sunset,conditions,visibility,uvindex,pressure,feelslike,humidity,datetime,icon,windspeed,windgust,dew,description`;

        // Make the API request
        let resp1 = await axios.get(endpoint);
        const r = resp1.data;
        console.log(r);

        // Render the 'main' view with the fetched data
        res.render("main", { r });
    } catch (error) {
        console.error('Error fetching data from VisualCrossing:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Define route for handling form submissions
app.post("/main", async (req, res) => {
    const { city } = req.body; // Retrieve the city from the request body
    req.session.city = city; // Update the session with the new city
    res.redirect("/"); // Redirect back to the homepage
});

// Start the server
app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});
