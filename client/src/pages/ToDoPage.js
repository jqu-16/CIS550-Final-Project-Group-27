import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Box, Tabs, Tab, LinearProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import RestaurantCard from '../components/RestaurantCard';

const config = require('../config.json');

export default function ToDoPage() {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [dist, setDist] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/todo`)
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson);
        const businessesWithId = resJson.map((business, index) => ({ id: index, ...business }));
        setData(businessesWithId);
        console.log("break 1");
      });

      fetch(`http://${config.server_host}:${config.server_port}/elitetop`)
      .then(res2 => res2.json())
      .then(resJson2 => {
        console.log(resJson2);
        const topBusiness = resJson2.map((business, index) => ({id: index, ...business}));
        setData2(topBusiness);
      });
  }, []);

  const search = () => {
    console.log("before");
    setLoaded(false);
    console.log("before2");
    fetch(`http://${config.server_host}:${config.server_port}/todo?lat=${lat} +
      &lon=${lon} +
      &dist=${dist}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        console.log("inside then")
        console.log(resJson);
        // http://localhost:8080/todo?lat=29.954421&lon=-90.066475&dist=10
        const businessesWithId = resJson.map((business, index) => ({ id: index, ...business }));
        setData(businessesWithId);
        fetch(`http://${config.server_host}:${config.server_port}/elitetop?lat=${lat} +
          &lon=${lon} +
          &dist=${dist}`)
          .then(res2 => res2.json())
          .then(resJson2 => {
            console.log(resJson2);
            const topBusiness = resJson2.map((business, index) => ({id: index, ...business}));
            setData2(topBusiness);
          });
      });
  };

  const handleSearchClick = () => {
    if (lat !== '' && lon !== '' && dist !== '') {
      setErrorMessage('');
      search();
    } else {
      setErrorMessage('Please fill out all fields.')
    }
  };

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      
      <h2>Enter Your Current Location...</h2>
      <Container 
        sx={{
          border: 1,
          borderColor: '#CFD9DC',
          borderRadius: '5px',
          pt: '10px',
          pb: '20px',
        }} 
      >
        <Typography color='error'>{errorMessage}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField variant='standard' size='small' name='lat_field' label='Latitude' value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: "100%" }}/>
          </Grid>
          <Grid item xs={4}>
            <TextField variant='standard' size='small' name='lon_field' label='Longitude' value={lon} onChange={(e) => setLon(e.target.value)} style={{ width: "100%" }}/>
          </Grid>
          <Grid item xs={4}>
            <TextField variant='standard' size='small' name='dist_field' label='Distance (km)' value={dist} onChange={(e) => setDist(e.target.value)} style={{ width: "100%" }}/>
          </Grid>
        </Grid>
        <Box sx={{mt: '20px'}}>
          <Button variant='contained' size='small' disableElevation onClick={handleSearchClick}>
            Search
          </Button>
        </Box>
      </Container>
      <h2>Suggested Itineraries</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell key='#' style={{ fontStyle: 'italic' }}>Itinerary</TableCell>
              <TableCell key='r' style={{ fontStyle: 'italic' }}>Business</TableCell>
              <TableCell key='a1' style={{ fontStyle: 'italic' }}>Attraction 1</TableCell>
              <TableCell key='a2' style={{ fontStyle: 'italic' }}>Attraction 2</TableCell>
              <TableCell key='a3' style={{ fontStyle: 'italic' }}>Attraction 3</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              // TODO (TASK 23): render the table content by mapping the songData array to <TableRow> elements
              // Hint: the skeleton code for the very first row is provided for you. Fill out the missing information and then use a map function to render the rest of the rows.
              // Hint: it may be useful to refer back to LazyTable.js
              // this maps each entry of songData to a row
              data.map((row, idx) =>
                <TableRow key={idx}>
                  <TableCell key='#'>{idx + 1}</TableCell>
                  <TableCell key='r'>{data[idx].Bname}</TableCell>
                  <TableCell key='a1'>{data[idx].W1name}</TableCell>
                  <TableCell key='a2'>{data[idx].W2name}</TableCell>
                  <TableCell key='a3'>{data[idx].W3name}</TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </TableContainer>
      <h2>Nearby Top Rated Businesses by Yelp Elites</h2>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell key='a1' style={{ fontStyle: 'italic' }}>Name</TableCell>
              <TableCell key='a2' style={{ fontStyle: 'italic' }}>Type</TableCell>
              <TableCell key='a3' style={{ fontStyle: 'italic' }}>Average Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              // TODO (TASK 23): render the table content by mapping the songData array to <TableRow> elements
              // Hint: the skeleton code for the very first row is provided for you. Fill out the missing information and then use a map function to render the rest of the rows.
              // Hint: it may be useful to refer back to LazyTable.js
              // this maps each entry of songData to a row
              data2.map((row, idx) =>
                <TableRow key={idx}>
                  <TableCell key='a1'>{data2[idx].name}</TableCell>
                  <TableCell key='a2'>{data2[idx].category_name}</TableCell>
                  <TableCell key='a3'>{data2[idx].star.toFixed(2)}</TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};