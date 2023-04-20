import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

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
          <h1 style={{ fontSize: 64 }}>{businessData.name}</h1>
          <h2>Stars: {businessData.stars}</h2>
          <h2>Reviews: {businessData.review_count}</h2>
          <h2>Address: {businessData.address}</h2>
          <h2>City: {businessData.city}</h2>
          <h2>State: {businessData.state}</h2>
        </Stack>
      </Stack>
      
    </Container>
  );
}