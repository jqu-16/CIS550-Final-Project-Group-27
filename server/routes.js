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
    ), 
    OneReview AS (
      SELECT r.*, u.name AS user_name, date AS user_date
      FROM Review r
      JOIN Business b ON r.business_id = b.business_id
      JOIN User u ON u.user_id = r.user_id
      WHERE r.business_id = "${req.params.business_id}"
    )
    SELECT b.name, b.stars AS overall_stars, b.review_count, l.address, l.city, l.state, r.*
    FROM OneBusiness b, OneLocation l, OneReview r
    ORDER BY r.date DESC`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

const top_restaurants = async function(req, res) {
  const lat = req.query.lat ?? 39.9526;
  const lon = req.query.lon ?? -75.1652;
  const dist = req.query.dist ?? 10;
  connection.query(`
    SELECT O.business_id, O.name, O.stars, O.review_count, (ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371) as dist
    FROM Business O JOIN Location L ON O.business_id = L.business_id
    WHERE ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371 < ${dist}
    AND O.review_count >= 20
    AND O.stars > 4
    ORDER BY dist ASC
    LIMIT 5
    `
    , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
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
    WHERE ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371 < ${dist}
    ORDER BY dist ASC`
    , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}

// GET /closestAttraction
const closestAttraction = async function(req, res) {
  const lat = req.query.lat ?? 39.9526;
  const lon = req.query.lon ?? -75.1652;
  const dist = req.query.dist ?? 10;
  connection.query(`
    SELECT a.name, (ACOS(SIN(${lat}* PI()/180) * SIN(a.Y* PI()/180) + COS(${lat}* PI()/180) * COS(a.Y* PI()/180) * COS(a.X* PI()/180 - ${lon}* PI()/180)) * 6371) as dist
    FROM Attraction a
    WHERE ACOS(SIN(${lat}* PI()/180) * SIN(a.Y* PI()/180) + COS(${lat}* PI()/180) * COS(a.Y* PI()/180) * COS(a.X* PI()/180 - ${lon}* PI()/180)) * 6371 < ${dist}
    ORDER BY dist ASC`
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
// GET /todo
const todo = async function(req, res) {
    const dist = req.query.dist ?? 10;
    const lat = req.query.lat ?? 39.9526;
    const lon = req.query.lon ?? -75.1652;
    connection.query(`
    WITH WithinDistanceBusinessTemp AS
    (SELECT B.business_id, name
    FROM Business B JOIN Location L ON B.business_id = L.business_id
    WHERE L.latitude <= ${lat} + ${dist}/111 AND L.latitude >= ${lat} - ${dist}/111 AND L.longitude <= ${lon} + ${dist}/111 AND L.longitude >= ${lon} - ${dist}/111),
    WithinDistanceAttractionTemp AS
    (SELECT name, X * PI()/180 AS X, Y * PI()/180 AS Y
    FROM Attraction
    WHERE Y <= ${lat} + 3 * ${dist}/111 AND Y >= ${lat} - 3 * ${dist}/111 AND X <= ${lon} + 3 * ${dist}/111 AND X >= ${lon} - 3 * ${dist}/111),
    WithinDistanceBusiness AS
    (SELECT O.business_id, name, L.latitude * PI()/180 AS latitude, L.longitude * PI()/180 AS longitude
    FROM WithinDistanceBusinessTemp O JOIN Location L ON O.business_id = L.business_id
    WHERE ACOS(SIN(${lat} * PI()/180) * SIN(latitude * PI()/180) + COS(${lat} * PI()/180) * COS(latitude * PI()/180) * COS((longitude - ${lon}) * PI()/180)) * 6371 < ${dist}),
    WithinDistanceAttraction1 AS
    (SELECT A.name, X, Y, W.name AS Bname
    FROM WithinDistanceAttractionTemp A, WithinDistanceBusiness W
    WHERE ACOS(SIN(W.latitude) * SIN(Y) + COS(W.latitude) * COS(Y) * COS(W.longitude - X)) * 6371 < ${dist}
    ORDER BY RAND()
    LIMIT 20),
    WithinDistanceAttraction2 AS
    (SELECT A.name, A.X, A.Y, W1.name AS W1name, Bname
    FROM WithinDistanceAttractionTemp A, WithinDistanceAttraction1 W1
    WHERE ACOS(SIN(A.Y) * SIN(W1.Y) + COS(A.Y) * COS(W1.Y) * COS(A.X - W1.X)) * 6371 < ${dist}
    ORDER BY RAND()
    LIMIT 20),
    WithinDistanceAttraction3 AS
    (SELECT A.name, A.X, A.Y, W2.name AS W2name, W1name, Bname
    FROM WithinDistanceAttractionTemp A, WithinDistanceAttraction2 W2
    WHERE ACOS(SIN(A.Y) * SIN(W2.Y) + COS(A.Y) * COS(W2.Y) * COS(A.X - W2.X)) * 6371 < ${dist}
    ORDER BY RAND()
    LIMIT 5)
    SELECT Bname, W1name, W2name, W3.name AS W3name
    FROM WithinDistanceAttraction3 W3`
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
  closestAttraction,
  random,
}