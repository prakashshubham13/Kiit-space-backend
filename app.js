//importing package
const express = require('express');
const mongoose = require('mongoose');
require("dotenv/config");
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(cors())
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//import routes
const userRoute = require('./routes/api');

app.use('/users', userRoute);

//Connect to db
mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, () => {
    console.log("connected")
})

//listening to server
app.listen(port);