import React from 'react';
import { makeStyles, Typography, Button } from '@material-ui/core';
import { useSelector } from 'store';
import RestaurantStatus from 'components/restaurant-status/RestaurantStatus';
import packageJson from '../../package.json';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  formControl: {
    maxWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    '& div': {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    margin: '20px 0',
  },
  exitButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

interface StatusProps {
  wsConnected: boolean;
  handleLogout(): void;
}

const Status: React.FC<StatusProps> = ({ wsConnected, handleLogout }) => {
  const classes = useStyles();
  const restaurant = useSelector(state => state.restaurant);
  const user = useSelector(state => state.user);

  return (
    <div className={classes.container}>
      <Typography variant="h4">{restaurant?.name}</Typography>
      <Typography variant="body1" color="textSecondary">
        {user.name}
      </Typography>
      <RestaurantStatus wsConnected={wsConnected} />
      <Button className={classes.exitButton} color="primary" variant="text" onClick={handleLogout} size="small">
        Sair
      </Button>
      <div>
        <Typography>Versão {packageJson.version}</Typography>
      </div>
    </div>
  );
};

export default Status;
