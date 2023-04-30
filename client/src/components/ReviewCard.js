import { Card, CardContent, Typography, Rating } from '@mui/material';

export default function ReviewCard({ name, date, stars, text }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {name}
        </Typography>
        <Rating value={stars} precision={0.1} readOnly />
        <Typography variant="subtitle2" color="text.secondary">
          Time posted: {date}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
}