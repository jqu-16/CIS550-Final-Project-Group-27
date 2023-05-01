import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Box, Tabs, Tab, LinearProgress, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
import ExpertCard from '../components/ExpertCard';
import RestaurantCard from '../components/RestaurantCard';

const config = require('../config.json');

export default function ExpertPage() {
  const [data, setData] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [dist, setDist] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/expert`)
      .then(res => res.json())
      .then(resJson => {
        const businessesWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(businessesWithId);
        setTimeout(() => {
          setLoaded(true);
        }, 200);
      });
  }, []);

  const search = () => {
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

      <h2>Restaurants</h2>
      {loaded
        ? 
          <Grid container spacing={2}>
            {data.map((value, i) => (
              <Grid key={i} item xs={6} md={4}>
                <ExpertCard 
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
    </Container>
  );
};