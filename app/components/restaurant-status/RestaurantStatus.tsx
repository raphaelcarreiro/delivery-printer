import React from 'react';
import { Typography } from '@material-ui/core';
import { MdFiberManualRecord } from 'react-icons/md';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'store/selector';

const useStyles = makeStyles({
  status: ({ restaurantIsOpen }: { restaurantIsOpen: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      color: restaurantIsOpen ? '#28a745' : '#dc3545',
      marginRight: 6,
      fontSize: 26,
    },
  }),
  statusContainer: {
    display: 'flex',
    borderRadius: 4,
    height: 45,
    flexShrink: 0,
    width: 350,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface RestaurantStatusProps {
  wsConnected: boolean;
}

const RestaurantStatus: React.FC<RestaurantStatusProps> = ({ wsConnected }) => {
  const restaurant = useSelector(state => state.restaurant);
  const classes = useStyles({ restaurantIsOpen: restaurant?.is_open || false });

  return (
    <>
      {wsConnected ? (
        <div className={classes.statusContainer}>
          <Typography color="inherit" className={classes.status}>
            <MdFiberManualRecord />
            {restaurant?.is_open ? 'online' : 'offline'}
          </Typography>
        </div>
      ) : (
        <div className={classes.statusContainer}>
          <Typography color="inherit" className={classes.status}>
            <MdFiberManualRecord />
            conectando...
          </Typography>
        </div>
      )}
    </>
  );
};

export default RestaurantStatus;
