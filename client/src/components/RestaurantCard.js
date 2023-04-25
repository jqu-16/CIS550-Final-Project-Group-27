import { 
    Box,
    Card,
    Stack,
    Typography, 
    CardActionArea,
    CardContent,
    Rating,
  } from '@mui/material';
  import CircleIcon from '@mui/icons-material/Circle';
  import { useNavigate } from 'react-router-dom';

  function RestaurantCard(props) {
    const navigate = useNavigate();
    const navRestaurant = () => {
      navigate(`/business/${props.business_id}`);
    }

    return (
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: '#CFD9DC',
          borderRadius: '5px',
        }} 
      >
        <CardActionArea onAnimationEnd={navRestaurant}>
          <CardContent>
            <Box sx={{
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              }}
            >
              <Stack spacing={0.5}>
                <Typography 
                  fontWeight={500}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: '1',
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {props.name}
                </Typography>
                <Typography variant='body2'>{`${(Math.round(props.dist * 100) / 100).toFixed(2)} mi`}</Typography>
                <Typography variant='body2'>{`${props.review_count} reviews`}</Typography>
              </Stack>
              <Rating value={parseFloat(props.stars)} precision={0.5} size='small' readOnly />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  export default RestaurantCard;