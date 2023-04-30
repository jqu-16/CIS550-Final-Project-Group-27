import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Rating, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReviewCard from '../components/ReviewCard';

const config = require('../config.json');

export default function BusinessInfoPage() {
  const { business_id } = useParams();

  const [businessData, setBusinessData] = useState([{}]); // default should actually just be [], but empty object element added to avoid error in template code

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/business/${business_id}`)
      .then(res => res.json())
      .then(resJson => setBusinessData(resJson));
  }, [business_id]);

  return (
    <Container>
      <Stack direction='row' justify='center'>
        <Stack>
          <h1 style={{ fontSize: 64 }}>{businessData[0].name}</h1>
          {/* <h2> Rating: <Rating value={businessData[0].stars} precision={0.1} readOnly /></h2> */}
          <h2>Rating: {businessData[0].stars} / 5</h2>
          <h2>Address: {businessData[0].address}</h2>
          <h2>City: {businessData[0].city}</h2>
          <h2>State: {businessData[0].state}</h2>
          <h2>{businessData.length === 50 ? `${businessData.length}+ reviews:` : `${businessData.length} reviews:`}</h2>

          <Container>
            {businessData && (
              <Grid container spacing={2}>
                {businessData.map((item, index) => (
                  <Grid key={index-1} item xs={12} md={6}>
                    <ReviewCard name={item.user_name} date = {item.user_date} stars={item.stars} text={item.text} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Stack>
      </Stack>
      
    </Container>
  );
}