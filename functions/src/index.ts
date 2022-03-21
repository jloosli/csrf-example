import * as functions from 'firebase-functions';

exports.bigben = functions.https.onRequest((req, res) => {
  const hours = (new Date().getHours() % 12) + 1; // London is UTC + 1hr;
  res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
    <h1>Big Ben!</h1>
      ${'BONG '.repeat(hours)}
    </body>
  </html>`);
});
