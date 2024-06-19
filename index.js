require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');

mongoose.connect(process.env.MONGO_URI);

const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  short_url: {
    type: String,
    required: true
  }
});

const Url = mongoose.model('url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(originalUrl).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" })
      } else {
        const urlCount = await Url.countDocuments({});
        const urlObj = {
          url: originalUrl,
          short_url: urlCount
        }
        const result = await Url.create(urlObj);
        console.log(result);
        res.json({
          original_url: originalUrl,
          short_url: urlCount
        })
      }
    })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url;
  const urlObj = await Url.findOne({ short_url: +shorturl });
  res.redirect(urlObj.url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
