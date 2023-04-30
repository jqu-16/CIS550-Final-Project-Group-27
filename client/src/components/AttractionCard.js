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

  function AttractionCard(props) {
    /*const navigate = useNavigate();
    const navRestaurant = () => {
      navigate(`/business/${props.business_id}`);
    }*/

    return (
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: '#CFD9DC',
          borderRadius: '5px',
        }} 
      >
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
              </Stack>
            </Box>
          </CardContent>
      </Card>
    );
  }

  export default AttractionCard;