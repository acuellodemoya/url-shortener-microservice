require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const URL = require('./models/URL');
const app = express();

const port = process.env.PORT || 3000;
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

const URI =
  'mongodb+srv://root:12345@cluster0.dsrte.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('connected'))
  .catch((err) => console.log(err));

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

//routes
app.post(
  '/api/shorturl',
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let obj = {};
    const url = req.body.url;
    let regex = new RegExp(
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
    );

    if (!url.match(regex)) {
      res.json({ error: 'invalid url' });
      return;
    }

    obj['original_url'] = url;

    let short = 1;
    URL.findOne({})
      .sort({ short_url: 'desc' })
      .exec((err, result) => {
        if (!err && result != undefined) {
          short = result.short_url + 1;
        }
        if (!err) {
          URL.findOneAndUpdate(
            { original_url: url },
            { original_url: url, short_url: short },
            { new: true, upsert: true },
            (error, savedUrl) => {
              if (!error) {
                obj['short_url'] = savedUrl.short_url;
                res.json(obj);
              }
            }
          );
        }
      });
  }
);

app.get('/api/shorturl/:url', (req, res) => {
  const url = req.params.url;

  URL.findOne({ short_url: url }, (err, result) => {
    if (!err && result != undefined) {
      res.redirect(result.original_url);
    } else {
      res.json('URL not Found');
    }
  });
});
