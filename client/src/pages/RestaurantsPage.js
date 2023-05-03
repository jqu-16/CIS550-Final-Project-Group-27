import { useEffect, useState } from 'react';
import { Radio, RadioGroup, FormControl, FormLabel, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Box, Tabs, Tab, LinearProgress, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import RestaurantCard from '../components/RestaurantCard';
import UserCard from '../components/UserCard';

const config = require('../config.json');

export default function RestaurantsPage() {
  const [data, setData] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [dist, setDist] = useState('');
  const [searchType, setSearchType] = useState('search');
  const [loaded, setLoaded] = useState(false);
  const [influencersLoaded, setInfluencersLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/closest`)
      .then(res => res.json())
      .then(resJson => {
        const businessesWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(businessesWithId);
        setTimeout(() => {
          setLoaded(true);
        }, 200);
      });
    fetch(`http://${config.server_host}:${config.server_port}/friends`)
      .then(res => res.json())
      .then(resJson => {
        const temp = resJson.map((user) => ({ id: user.user_id, name: user.name, fans: user.fans, friendCount: user.friendCount }));
        setInfluencers(temp);
        setTimeout(() => {
          setInfluencersLoaded(true);
        }, 200);
      });
  }, []);

  const search = () => {
    setLoaded(false);
    fetch(`http://${config.server_host}:${config.server_port}/closest?lat=${lat}` +
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

  const searchTop = () => {
    setLoaded(false);
    fetch(`http://${config.server_host}:${config.server_port}/topRestaurants?lat=${lat}` +
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

  const searchExpert = () => {
    setLoaded(false);
    fetch(`http://${config.server_host}:${config.server_port}/expert?lat=${lat}` +
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

  const searchTakeout = () => {
    setLoaded(false);
    fetch(`http://${config.server_host}:${config.server_port}/takeout?lat=${lat}` +
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

  const getInfluencers = () => {
    setInfluencersLoaded(false);
    fetch(`http://${config.server_host}:${config.server_port}/friends?lat=${lat}` +
      `&lon=${lon}` +
      `&dist=${dist}`
    )
      .then(res => res.json())
      .then(resJson => {
        const temp = resJson.map((user) => ({ id: user.user_id, name: user.name, fans: user.fans, friendCount: user.friendCount }));
        setInfluencers(temp);
        setTimeout(() => {
          setInfluencersLoaded(true);
        }, 200);
      });
  };

  const handleSearchClick = () => {
    if (lat !== '' && lon !== '' && dist !== '') {
      setErrorMessage('');
      if (searchType === 'search') {
        search();
      } else if (searchType === 'searchTakeout') {
        searchTakeout();
      } else if (searchType === 'searchExpert') {
        searchExpert();
      } else if (searchType === 'searchTop') {
        searchTop(); 
      }
      getInfluencers();
    } else {
      setErrorMessage('Please fill out all fields.')
    }
  };

  return (
    <Container sx={{pb: '35px'}}>
      <h2>Search</h2>
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
          <Grid item xs={4}>
          <FormControl>
            <RadioGroup
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <FormControlLabel value="search" control={<Radio />} label="All restaurants" />
              <FormControlLabel value="searchTakeout" control={<Radio />} label="Takeout" />
              <FormControlLabel value="searchExpert" control={<Radio />} label="Visited by experts (by category)" />
              <FormControlLabel value="searchTop" control={<Radio />} label="Top restaurants" />
            </RadioGroup>
          </FormControl>
          </Grid>
        </Grid>
        <Box sx={{mt: '20px'}}>
          <Button variant='contained' size='small' disableElevation onClick={handleSearchClick}>
            Search
          </Button>
        </Box>
      </Container>
      <h2>Restaurants</h2>
      {loaded
        ? 
          <Grid container spacing={2}>
            {data.map((value, i) => (
              <Grid key={i} item xs={6} md={4}>
                <RestaurantCard 
                  key={i}
                  business_id={value.business_id}
                  name={value.name}
                  stars={value.stars}
                  review_count={value.review_count}
                  dist={value.dist}
                  experts_count={value.experts_count}
                  category={value.category_name}
                />
              </Grid>
            ))}
          </Grid>
        : <LinearProgress />
      }
      <h2>Influencers</h2>
      {influencersLoaded
        ? 
          <Grid container spacing={2}>
            {influencers.map((value, i) => (
              <Grid key={i} item xs={6} md={4}>
                <UserCard 
                  key={i}
                  id={value.id}
                  name={value.name}
                  fans={value.fans}
                  friendCount={value.friendCount}
                />
              </Grid>
            ))}
          </Grid>
        : <LinearProgress color='secondary' />
      }
    </Container>
  );
};