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
      FROM Business b
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
    ORDER BY r.date DESC
    LIMIT 50`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

const topRestaurants = async function(req, res) {
  const lat = req.query.lat ?? 39.9526;
  const lon = req.query.lon ?? -75.1652;
  const dist = req.query.dist ?? 10;
  connection.query(`
    SELECT O.*, l.city
    FROM Business O 
    JOIN Location l
    ON l.business_id = O.business_id
    WHERE stars > 4
    ORDER BY review_count DESC
    LIMIT 42
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
    FROM Business O 
    JOIN Location L ON O.business_id = L.business_id
    JOIN Category c ON O.business_id = c.business_id
    WHERE ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371 < ${dist}
    AND c.category_name LIKE 'Restaurants'
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

//top businesses by Yelp Elites
// GET /elitetop

const elitetop = async function(req, res) {
  const dist = req.query.dist ?? 10;
  const lat = req.query.lat ?? 39.9526;
  const lon = req.query.lon ?? -75.1652;
  connection.query(`
  WITH WithinDistanceBusinessTemp AS (SELECT B.business_id, name
    FROM Business B JOIN Location L ON B.business_id = L.business_id
    WHERE L.latitude <= ${lat} + ${dist}/111 AND L.latitude >= ${lat} - ${dist}/111 AND L.longitude <= ${lon} + ${dist}/111 AND ${lon} >= L.longitude - ${dist}/111),
    
    wdbtemp2 AS (SELECT O.business_id, O.name, L.latitude * PI()/180 AS latitude, L.longitude * PI()/180 AS longitude
    FROM WithinDistanceBusinessTemp O JOIN Location L ON O.business_id = L.business_id
    WHERE ACOS(SIN(${lat} * PI()/180) * SIN(latitude * PI()/180) + COS(${lat} * PI()/180) * COS(latitude * PI()/180) * COS((longitude - ${lon}) * PI()/180)) * 6371 < 10)
    
    SELECT DISTINCT c.business_id, temp2.name, GROUP_CONCAT(c.category_name SEPARATOR ', ') AS category_name, temp2.star
    FROM (SELECT DISTINCT temp.business_id, temp.name, AVG(temp.stars) AS star
    FROM (SELECT b.name, b.business_id, r.user_id, r.stars
    FROM wdbtemp2 b
    JOIN Review r ON b.business_id = r.business_id) temp
    WHERE temp.user_id IN
    (SELECT e.user_id
    FROM Elite e)
    GROUP BY temp.business_id
    HAVING AVG(temp.stars) > 4.0
    LIMIT 10) temp2
    JOIN Category c ON temp2.business_id = c.business_id
    GROUP BY c.business_id
    ORDER BY RAND()
    LIMIT 5`
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
      SELECT *
      FROM Business b
      JOIN Parking p ON b.business_id = p.business_id
      WHERE p.RestaurantTakeOut = 1
      LIMIT 3
    `), (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }

  }
}


const takeout = async function(req, res) {

  const lat = typeof req.query.lat === 'undefined' || req.query.lat === '' || req.query.lat === null ? 39.9526 : req.query.lat;
  const lon = typeof req.query.lat === 'undefined' || req.query.lon === '' || req.query.lon === null ? -75.1652 : req.query.lon;
  const dist = typeof req.query.lat === 'undefined' || req.query.dist === '' || req.query.dist === null ? 10 : req.query.dist;

  connection.query(`
  SELECT *, (ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371) as dist
  FROM Business b
  JOIN Parking p ON b.business_id = p.business_id
  JOIN Location L ON b.business_id = L.business_id
  JOIN Category c ON b.business_id = c.business_id
  WHERE c.category_name LIKE 'Restaurants'
  AND p.RestaurantTakeOut = 1
  AND (ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - ${lon})) * 6371) < ${dist}
  ORDER BY dist ASC
  LIMIT 18`
    , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
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

const expert = async function(req, res) {

  const lat = typeof req.query.lat === 'undefined' || req.query.lat === '' || req.query.lat === null ? 39.9526 : req.query.lat;
  const lon = typeof req.query.lat === 'undefined' || req.query.lon === '' || req.query.lon === null ? -75.1652 : req.query.lon;
  const dist = typeof req.query.lat === 'undefined' || req.query.dist === '' || req.query.dist === null ? 10 : req.query.dist;

  connection.query(`
  WITH FilteredBusinesses AS (
    SELECT
      O.business_id,
      O.name,
      O.stars,
      O.review_count,
      O.is_open,
      (ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - (${lon}))) * 6371) AS dist
    FROM
      Business O
    JOIN Location L ON O.business_id = L.business_id
    JOIN Category c ON O.business_id = c.business_id
    WHERE
      ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - (${lon}))) * 6371 < ${dist}
      AND c.category_name LIKE 'Restaurants'
    ORDER BY
  dist ASC
 ),
 CloseReviews AS (
 SELECT R.*
 FROM Review R
 JOIN FilteredBusinesses ON R.business_id = FilteredBusinesses.business_id
 ),
 FilteredUsers AS (
    SELECT user_id
    FROM User
    WHERE fans > 500
 ),
 FilteredReviews AS (
  SELECT CR.business_id, COUNT(*) AS review_count
  FROM CloseReviews CR
  JOIN FilteredUsers ON CR.user_id = FilteredUsers.user_id
  GROUP BY CR.business_id
 ),
 RankedRestaurants AS (
    SELECT
    B.*,
    C.category_name,
    FR.review_count AS experts_count,
    RANK() OVER (PARTITION BY C.category_name ORDER BY FR.review_count DESC) AS ranking
    FROM
    FilteredBusinesses B
    JOIN FilteredReviews FR ON B.business_id = FR.business_id
    JOIN Category C ON B.business_id = C.business_id
    WHERE
    B.is_open = 1
 )
 SELECT *
 FROM
   RankedRestaurants
 WHERE
   ranking <= 3
 ORDER BY
   category_name,
   ranking;`
    , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        // console.log(JSON.stringify(data))
        res.json(data);
      }
    });
}

const friends = async function(req, res) {

  const lat = typeof req.query.lat === 'undefined' || req.query.lat === '' || req.query.lat === null ? 39.9526 : req.query.lat;
  const lon = typeof req.query.lat === 'undefined' || req.query.lon === '' || req.query.lon === null ? -75.1652 : req.query.lon;
  const dist = typeof req.query.lat === 'undefined' || req.query.dist === '' || req.query.dist === null ? 10 : req.query.dist;

  connection.query(`
  WITH FilteredBusinesses AS (
    SELECT
      O.business_id,
      O.name,
      O.stars,
      O.review_count,
      O.is_open,
      (ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - (${lon}))) * 6371) AS dist
    FROM
      Business O
    JOIN Location L ON O.business_id = L.business_id
    JOIN Category c ON O.business_id = c.business_id
    WHERE
      ACOS(SIN(${lat}) * SIN(latitude) + COS(${lat}) * COS(latitude) * COS(longitude - (${lon}))) * 6371 < ${dist}
      AND c.category_name LIKE 'Restaurants'
    ORDER BY
  dist ASC
 ), CloseReviews AS (
  SELECT R.*
  FROM Review R
  JOIN FilteredBusinesses ON R.business_id = FilteredBusinesses.business_id
), UserWithManyFans AS (
SELECT user_id
FROM User
WHERE fans > 1000
),
FriendsOfPopularUsers AS (
SELECT DISTINCT friend_two AS user_id, COUNT(*) AS friendCount
FROM FriendOf
JOIN UserWithManyFans ON friend_one = UserWithManyFans.user_id
JOIN CloseReviews ON CloseReviews.user_id = friend_one
GROUP BY friend_two
ORDER BY friendCount DESC
LIMIT 30
)
SELECT *
FROM User
JOIN FriendsOfPopularUsers ON User.user_id = FriendsOfPopularUsers.user_id;`
    , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        // console.log(JSON.stringify(data))
        res.json(data);
      }
    });
}

module.exports = {
  businesses,
  business,
  closest,
  todo,
  author,
  closestAttraction,
  elitetop,
  random,
  topRestaurants,
  takeout,
  expert,
  friends
}