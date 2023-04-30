import { useEffect, useState } from 'react';
import { Stack, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Box, Tabs, Tab, LinearProgress, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import RestaurantCard from '../components/RestaurantCard';
import AttractionCard from '../components/AttractionCard';

const config = require('../config.json');

export default function AttractionPage() {
  const [data, setData] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [dist, setDist] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/closestAttraction`)
      .then(res => res.json())
      .then(resJson => {
        //const businessesWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(resJson);
        setTimeout(() => {
          setLoaded(true);
        }, 200);
      });
  }, []);

  const search = () => {
    setLoaded(false);
    fetch(`http://${config.server_host}:${config.server_port}/closestAttraction?lat=${lat}` +
      `&lon=${lon}` +
      `&dist=${dist}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const businessesWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(businessesWithId);
        setTimeout(() => {
          setLoaded(true);
        }, 200);
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
      <h2>Local Attractions</h2>
      <Stack direction='row' justify='center'>
        <Stack>
          <Container>
            {data && (
              <Grid container spacing={2}>
                {data.map((item, index) => (
                  <Grid key={index} item xs={12} md={6}>
                    <AttractionCard name={item.name} dist={item.dist} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Stack>
      </Stack>
      
    </Container>
  );
};