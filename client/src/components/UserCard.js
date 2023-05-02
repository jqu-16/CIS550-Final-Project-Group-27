import { 
    Box,
    Card,
    Stack,
    Typography, 
    CardActionArea,
    CardContent,
    Rating,
    Avatar,
  } from '@mui/material';
  import CircleIcon from '@mui/icons-material/Circle';

  function UserCard(props) {
    function stringToColor(string) {
      let hash = 0;
      let i;
    
      /* eslint-disable no-bitwise */
      for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }
    
      let color = '#';
    
      for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
      }
      /* eslint-enable no-bitwise */
    
      return color;
    }
    
    function stringAvatar(name) {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: name[0],
      };
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
              <Typography variant='body2'>{`${props.fans} fan(s)`}</Typography>
              <Typography variant='body2'>{`Friends with ${props.friendCount} super user(s)`}</Typography>
            </Stack>
            <Avatar {...stringAvatar(props.name)} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  export default UserCard;