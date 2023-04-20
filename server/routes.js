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
  //res.json([]); // replace this with your implementation
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















// Route 13: GET /author/:type
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



// TEMPLATE COPIED FROM HW2, PLEASE COPY AND CHANGE ACCORDINGLY







/********************************
 * BASIC SONG/ALBUM INFO ROUTES *
 ********************************/




// Route 3: GET /song/:song_id
const song = async function(req, res) {
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Most of the code is already written for you, you just need to fill in the query
  connection.query(`
    SELECT *
    FROM Business
    LIMIT 1`
    , (err, data) => {
      console.log(data);
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 4: GET /album/:album_id
const album = async function(req, res) {
  // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
  connection.query(`
    SELECT *
    FROM Albums
    WHERE Albums.album_id = "${req.params.album_id}"`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  }); // replace this with your implementation
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
  connection.query(`
    SELECT *
    FROM Albums
    ORDER BY Albums.release_date DESC`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
  //res.json([]); // replace this with your implementation
}

// Route 6: GET /album_songs/:album_id
const album_songs = async function(req, res) {
  // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
  connection.query(`
    SELECT s.song_id, s.title, s.number, s.duration, s.plays
    FROM Albums
    JOIN Songs s ON Albums.album_id = s.album_id
    WHERE Albums.album_id = "${req.params.album_id}"
    ORDER BY s.number`
    , (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
  //res.json([]); // replace this with your implementation
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = req.query.page_size ? req.query.page_size : 10;

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    //res.json([]); // replace this with your implementation
    connection.query(`
      SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
      FROM Songs s
      JOIN Albums a ON a.album_id = s.album_id
      ORDER BY s.plays DESC`
      , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    //res.json([]); // replace this with your implementation
    connection.query(`
      SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
      FROM Songs s
      JOIN Albums a ON a.album_id = s.album_id
      ORDER BY s.plays DESC
      LIMIT ${pageSize}
      OFFSET ${pageSize * (page - 1)}`
      , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
  //res.json([]); // replace this with your implementation
  const page = req.query.page;
  const pageSize = req.query.page_size ? req.query.page_size : 10;

  if (!page) {

    connection.query(`
      SELECT a.album_id, a.title, SUM(s.plays) AS plays
      FROM Albums a
      JOIN Songs s ON a.album_id = s.album_id
      GROUP BY a.album_id
      ORDER BY plays DESC`
      , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    
    connection.query(`
      SELECT a.album_id, a.title, SUM(s.plays) AS plays
      FROM Albums a
      JOIN Songs s ON a.album_id = s.album_id
      GROUP BY a.album_id
      ORDER BY plays DESC
      LIMIT ${pageSize}
      OFFSET ${pageSize * (page - 1)}`
      , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}

// Route 9: GET /search_songs
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;
  const plays_low = req.query.plays_low ?? 0;
  const plays_high = req.query.plays_high ?? 1100000000;
  const danceability_low = req.query.danceability_low ?? 0;
  const danceability_high = req.query.danceability_high ?? 1;
  const energy_low = req.query.energy_low ?? 0;
  const energy_high = req.query.energy_high ?? 1;
  const valence_low = req.query.valence_low ?? 0;
  const valence_high = req.query.valence_high ?? 1;
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  //res.json([]); // replace this with your implementation
  connection.query(`
      SELECT *
      FROM Songs
      WHERE (explicit <= ${explicit})
      AND (title LIKE "${'%' + title + '%'}")
      AND (duration <= ${durationHigh} AND duration >= ${durationLow})
      AND (plays <= ${plays_high} AND plays >= ${plays_low})
      AND (danceability <= ${danceability_high} AND danceability >= ${danceability_low})
      AND (energy <= ${energy_high} AND energy >= ${energy_low})
      AND (valence <= ${valence_high} AND valence >= ${valence_low})
      ORDER BY title`
      , (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
}

module.exports = {
  businesses,
  business,
  closest,
  author,
  random,
  song,
  album,
  albums,
  album_songs,
  top_songs,
  top_albums,
  search_songs,
}