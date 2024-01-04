const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser'); // Require body-parser for parsing POST request body
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware for parsing POST request body

// Function to format a date as 'YYYY-MM-DD'
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Clone the date and add 5 days
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 5);
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}/${year}-${endMonth}-${endDay}`;
};
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
const t = getCurrentDateTimeFormatted()
console.log(t);
app.get("/", (req, res) => {
    res.render('home');
});

// POST route to handle the form submission
app.post("/main", async (req, res) => {
    try {
        const { city } = req.body; // Retrieve the city from the request body
        const currentDate = new Date();
        const formattedCurrentDate = formatDate(currentDate);
        const key = 'XGGTZ3FYHMN5FDFFFF7CFF5JK';
        let endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${formattedCurrentDate}?key=${key}&unitGroup=metric&elements=tempmax,tempmin,temp,sunrise,sunset,conditions,visibility,uvindex,pressure,feelslike,humidity`;

        //https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Dehradun/2024-01-04?key=XGGTZ3FYHMN5FDFFFF7CFF5JK
        let resp1 = await axios.get(endpoint);
        const r = resp1.data;
        console.log(r)
        endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${t}?key=${key}&unitGroup=metric`
        resp1 = await axios.get(endpoint);
        const r2 = resp1.data;
        // console.log(r2);
        res.render("main", { r })
    } catch (error) {
        console.error('Error fetching data from VisualCrossing:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});
