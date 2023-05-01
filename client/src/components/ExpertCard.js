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
  import RestaurantCard from '../components/RestaurantCard';

  function ExpertCard(props) {
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
              {props.category !== undefined && <h2>{props.category}</h2>}

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

                {props.dist ? <Typography variant='body2'>{`${(Math.round(props.dist * 100) / 100).toFixed(2)} mi`}</Typography> : null}
                {props.city ? <Typography variant='body2'>{props.city}</Typography> : null}

                <Typography variant='body2'>{`${props.review_count} reviews`}</Typography>
                
                {props.experts_count !== undefined && (
  <Typography variant='body2'>{`${props.experts_count} ${props.experts_count === 1 ? 'expert' : 'experts'} visited`}</Typography>
)}

              </Stack>
              <Rating value={parseFloat(props.stars)} precision={0.5} size='small' readOnly />
            </Box>
           
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  export default RestaurantCard;