const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/businesses', routes.businesses);
app.get('/business/:business_id', routes.business);
app.get('/closest', routes.closest);
app.get('/todo', routes.todo);
app.get('/elitetop', routes.elitetop);
app.get('/closestAttraction', routes.closestAttraction);
app.get('/author/:type', routes.author);
app.get('/random', routes.random);
app.get('/topRestaurants', routes.topRestaurants);
app.get('/takeout', routes.takeout);
app.get('/expert', routes.expert);
app.get('/friends', routes.friends);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
