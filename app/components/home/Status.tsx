import React from 'react';
import { makeStyles, Typography, Button } from '@material-ui/core';
import { useSelector } from 'store';
import RestaurantStatus from 'components/restaurant-status/RestaurantStatus';

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
});

interface StatusProps {
  wsConnected: boolean;
  handleLogout(): void;
}

const Status: React.FC<StatusProps> = ({ wsConnected, handleLogout }) => {
  const classes = useStyles();
  const restaurant = useSelector((state) => state.restaurant);
  // const { handleSetRealTime, realTime } = useHomePage();
  const user = useSelector((state) => state.user);

  return (
    <div className={classes.container}>
      <Typography variant="h4">{restaurant.name}</Typography>
      <Typography variant="body1" color="textSecondary">
        {user.name}
      </Typography>
      <RestaurantStatus wsConnected={wsConnected} />
      {/* <div className={classes.formControl}>
        <div>
          <span>TEMPO REAL</span>
          <Switch
            color="primary"
            onChange={handleSetRealTime}
            checked={realTime}
          />
        </div>
        <Typography variant="body2" color="textSecondary">
          Se desativado, a cada 1 minuto será verificado a existência de novos
          pedidos.
        </Typography>
      </div> */}
      <Button color="primary" variant="text" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  );
};

export default Status;
