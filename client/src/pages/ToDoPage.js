import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Box, Tabs, Tab, LinearProgress, Typography } from '@mui/material';
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
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [dist, setDist] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/todo`)
      .then(res => res.json())
      .then(resJson => {
        console.log("hello")
        console.log(resJson);
        const businessesWithId = resJson.map((business) => ({ id: business.name, ...business }));
        setData(businessesWithId);
        setTimeout(() => {
          setLoaded(true);
        }, 200);
      });
  }, []);

  const search = () => {
    console.log("before");
    setLoaded(false);
    console.log("before2");
    fetch(`http://${config.server_host}:${config.server_port}/todo?lat=${lat}` +
      `&lon=${lon}` +
      `&dist=${dist}`
    )
      .then(res => {res.json(); console.log("first then")})
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        console.log("inside then")
        const businessesWithId = resJson.map((business) => ({ id: business.name, ...business }));
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

  const columns = [
    /*{ field: 'title', headerName: 'Title', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedSongId(params.row.song_id)}>{params.value}</Link>
    ) },*/
    //{ field: 'title', headerName: 'Title', width: 300, renderCell: (params) => ()},
    { field: 'name', headerName: 'Name of Business' }
    /*{ field: 'energy', headerName: 'Energy' },
    { field: 'valence', headerName: 'Valence' },
    { field: 'tempo', headerName: 'Tempo' },
    { field: 'key_mode', headerName: 'Key' },
    { field: 'explicit', headerName: 'Explicit' },*/
  ]

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
      <h2>Planned Itinerary</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        //pageSize={pageSize}
        //rowsPerPageOptions={[5, 10, 25]}
        //onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
};