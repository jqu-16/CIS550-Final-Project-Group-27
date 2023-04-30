import { Card, CardContent, Typography, Rating } from '@mui/material';

export default function AttractionCard({ name, dist }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {name}
        </Typography>
        <Typography variant="subtitle2" >
          Distance: {dist.toFixed(2)} km
        </Typography>

      </CardContent>
    </Card>
  );
}