import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  const [lat, setLat] = useState([]);
  const [lon, setLon] = useState([]);
  const [dist, setDist] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/closest`)
      .then(res => res.json())
      .then(resJson => {
        const businessesWithId = resJson.map((business) => ({ id: business.business_id, ...business }));
        setData(businessesWithId);
      });
  }, []);

  const search = () => {
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
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedBusinessId(params.row.business_id)}>{params.value}</Link>
    ) },
    { field: 'name', headerName: 'Name' },
    { field: 'stars', headerName: 'Stars' },
    { field: 'review_count', headerName: 'Review Count' },
    { field: 'dist', headerName: 'Distance' }
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
      <h2>Search Songs</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField name='lat_field' label='Latitude' value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={8}>
          <TextField name='lon_field' label='Longitude' value={lon} onChange={(e) => setLon(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={8}>
          <TextField name='dist_field' label='Distance' value={dist} onChange={(e) => setDist(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>
      <h2>Results</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
};