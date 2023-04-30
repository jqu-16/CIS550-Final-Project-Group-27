import { AppBar, Container, Toolbar, Typography, Box, Tabs, Tab, Link } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AttractionsIcon from '@mui/icons-material/Attractions';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Here, we define the NavBar. Note that we heavily leverage MUI components
// to make the component look nice. Feel free to try changing the formatting
// props to how it changes the look of the component.

export default function NavBar() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(window.sessionStorage.getItem('selected') ? parseInt(window.sessionStorage.getItem('selected')) : 0);

  const navRestaurants = () => {
    navigate('/restaurants');
    window.sessionStorage.setItem('selected', 0);
    setSelected(0);
  };

  const navAttractions = () => {
    navigate('/attractions');
    window.sessionStorage.setItem('selected', 1);
    setSelected(1);
  };

  const navItinerary = () => {
    navigate('/todo');
    window.sessionStorage.setItem('selected', 2);
    setSelected(2);
  };

  return (
    <div>
      <AppBar position='static' elevation={0} sx={{height: '75px'}}>
        <Container maxWidth='xl'>
          <Toolbar disableGutters sx={{pt: '10px'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <TravelExploreIcon sx={{width: '35px', height: '35px'}} />
              <Typography variant='h5' ml='10px'>Travel Buddy</Typography>
            </div>  
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ width: '100%' }}>
        <Tabs centered value={selected} sx={{mt: '20px'}}>
          <Tab icon={<RestaurantIcon />} label="Restaurants" onClick={navRestaurants} />
          <Tab icon={<AttractionsIcon />} label="Attractions" onClick={navAttractions} />
          <Tab icon={<RestaurantIcon />} label="Itinerary" onClick={navItinerary} />
        </Tabs>
      </Box>
    </div>
  );
}