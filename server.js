const express = require('express');
const mongoose = require('mongoose');

const app = express()

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

var MONGODB_URI = process.env.MONGODB_URI|| "mongodb://localhost/mongoHeadlines";

var PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI);

app.listen(PORT, function() {
    console.log( 'App is listening on' + PORT)
});