const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');

const axios = require('axios');
const cheerio = require('cheerio');

const db = require('./models');

const PORT = process.env.PORT || 3000;

const app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('hello world');
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';


mongoose.connect(MONGODB_URI);

app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

// Connect to the Mongo DB
// mongoose.connect('mongodb://localhost/unit18Populater', { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get('/scrape', (req, res) => {
  // First, we grab the body of the html with axios
  axios.get('http://www.echojs.com/').then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $('article h2').each(function (i, element) {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children('a')
        .text();
      result.link = $(this)
        .children('a')
        .attr('href');

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then((dbArticle) => {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(err => res.json(err));
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send('Scrape Complete');
  });
});

// Route for getting all Articles from the db
app.get('/articles', (req, res) => {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then((articles) => {
      res.json(articles)
        .catch((err) => {
          res.json(err);
        });
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get('/articles/:id', (req, res) => {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findById(req.params.id)
    .populate('comment')
    .then((article) => {
      res.json(article);
    })
    .catch((err) => {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post('/articles/:id', (req, res) => {
  db.Note.create(req.body)
    .then(dbNote => db.Article.findByIdAndUpdate(
      req.params.id,
      { note: dbNote._id },
      { new: true },
    ))
    .then((updatedArticle) => {
      res.json(updatedArticle);
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});