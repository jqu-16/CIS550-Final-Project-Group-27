const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

// GET /businesses
const businesses = async function(req, res) {
  connection.query(`
    SELECT *
    FROM Business
    LIMIT 100`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// GET /business
const business = async function(req, res) {
  connection.query(`
    WITH OneBusiness AS (
      SELECT business_id, name, stars, review_count
      FROM Business
      WHERE business_id = "${req.params.business_id}"
    ),
    OneLocation AS (
      SELECT business_id, address, city, state
      FROM Location
      WHERE business_id = "${req.params.business_id}"
    )
    SELECT b.name, b.stars, b.review_count, l.address, l.city, l.state
    FROM OneBusiness b, OneLocation l`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// GET /closest
const closest = async function(req, res) {
  const lat = req.query.lat ?? 39.9526;
  const lon = req.query.lon ?? -75.1652;
  const dist = req.query.dist ?? 10;
  connection.query(`
    SELECT O.business_id, O.name, O.stars, O.review_count, (ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371) as dist
    FROM Business O JOIN Location L ON O.business_id = L.business_id
    WHERE ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371 < ${dist}`
    , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}

// recommend at most three things to do
const todo = async function(req, res) {
    const round = req.query.round ?? 1;
    const lat = req.query.lat ?? 39.9526;
    const lon = req.query.lon ?? -75.1652;
    connection.query(`
    WITH OpenBusinesses AS
    (SELECT B.business_id, B.name
    FROM Business B JOIN Hours H ON B.business_id = H.business_id
    WHERE B.business_id IN
    (SELECT business_id
    FROM Hours
    WHERE Hours.monday IS NOT NULL)),
    
    WithinDistanceBusiness AS
    (SELECT O.business_id, O.name, L.longitude, L.latitude
    FROM OpenBusinesses O JOIN Location L ON O.business_id = L.business_id
    WHERE ROUND(L.latitude, ${round}) = ROUND(${lat}, ${round}) AND ROUND(L.longitude, ${round}) = ROUND(${lon}, ${round})),
    
    AttractionEdited AS
    (SELECT A.name, A.X AS longitude, A.Y AS latitude
    FROM Attraction A
    WHERE ROUND(A.Y, ${round}) = ROUND(${lat}, ${round}) AND ROUND(A.X, ${round}) = ROUND(${lon}, ${round}))
    
    (SELECT *
    FROM AttractionEdited
    ORDER BY RAND()
    LIMIT 3)
    UNION
    (SELECT w.name, w.longitude, w.latitude
    FROM WithinDistanceBusiness w
    ORDER BY RAND()
    LIMIT 1)`
      , (err, data) => {
        if (err || data.length === 0) {
          console.log(err);
          res.json([]);
        } else {
          res.json(data);
        }
      });
  }

// Route 1: GET /takeout
const random = async function(req, res) {
  connection.query(`
      SELECT b.business_id, b.name
      FROM Business b
      JOIN Parking p ON b.business_id = p.business_id
      WHERE p.RestaurantTakeOut = 1
    `), (err, data) => {
    console.log(data);
    if (err || data.length == 0) {
      console.log(err);
      res.json({

      })
    }

  }
}

// GET /author/:type
const author = async function(req, res) {
  // TODO (TASK 1): replace the values of name and pennKey with your own
  const name = 'Kevin Li, Jeffrey Qu, Lucy Xu, Geshi Yeung';
  const pennKey = 'kevinmli, jqu, lucyrx22, geshi';

  // checks the value of type the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.send returns data back to the requester via an HTTP response
    res.send(`Created by ${name}`);
  } else if (req.params.type === 'pennkey') {
    // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back response 'Created by [pennkey]'
    res.send(`Created by ${pennKey}`);
  } else {
    // we can also send back an HTTP status code to indicate an improper request
    res.status(400).send(`'${req.params.type}' is not a valid author type. Valid types are 'name' and 'pennkey'.`);
  }
}

module.exports = {
  businesses,
  business,
  closest,
  todo,
  author,
  random,
}