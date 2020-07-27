import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  formatRelative,
  parseISO,
  formatDistanceStrict,
  format,
} from 'date-fns';
import ptbr from 'date-fns/locale/pt-BR';
import { useSelector, history } from 'store';
import { Typography, Button } from '@material-ui/core';
import { useApp } from 'containers/App';
import InsideLoading from 'components/loading/InsideLoading';
import io from 'socket.io-client';
import RestaurantStatus from 'components/restaurant-status/RestaurantStatus';
import { makeStyles } from '@material-ui/core/styles';
import { useAuth } from 'hooks/auth';
import constants from 'constants/url';
import { useDispatch } from 'react-redux';
import { setRestaurantIsOpen } from 'store/modules/restaurant/actions';
import Print from '../print/Print';
import { moneyFormat } from '../../helpers/NumberFormat';
import { OrderData } from './types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
  },
});

export default function Home(): JSX.Element {
  const [order, setOrder] = useState<OrderData | null>(null);
  const restaurant = useSelector((state) => state.restaurant);
  const user = useSelector((state) => state.user);
  const { loading } = useApp();
  const socket = useMemo(() => io.connect(constants.WS_BASE_URL), []);
  const [wsConnected, setWsConnected] = useState(false);
  const classes = useStyles();
  const auth = useAuth();
  const dispatch = useDispatch();

  function formatId(id: number) {
    return `#${`00000${id}`.slice(-6)}`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setWsConnected(socket.connected);
    }, 2000);

    if (restaurant.id) {
      if (socket.disconnected) socket.connect();
      setWsConnected(socket.connected);

      socket.emit('register', restaurant.id);

      socket.on('reconnect', () => {
        socket.emit('register', restaurant.id);
      });

      socket.on('handleRestaurantState', (response: { isOpen: boolean }) => {
        dispatch(setRestaurantIsOpen(response.isOpen));
      });

      socket.on('stored', (_order: OrderData) => {
        const date = parseISO(_order.created_at);
        const orderReceived: OrderData = {
          ..._order,
          formattedId: formatId(_order.id),
          formattedTotal: moneyFormat(_order.total),
          formattedChange: moneyFormat(_order.change - _order.total),
          formattedDate: formatRelative(date, new Date(), { locale: ptbr }),
          formattedSubtotal: moneyFormat(_order.subtotal),
          formattedDiscount: moneyFormat(_order.discount),
          formattedTax: moneyFormat(_order.tax),
          dateDistance: formatDistanceStrict(date, new Date(), {
            locale: ptbr,
            roundingMethod: 'ceil',
          }),
          products: _order.products.map((product) => {
            product.formattedFinalPrice = moneyFormat(product.final_price);
            product.formattedPrice = moneyFormat(product.price);
            return product;
          }),
          shipment: {
            ..._order.shipment,
            formattedScheduledAt: _order.shipment.scheduled_at
              ? format(parseISO(_order.shipment.scheduled_at), 'HH:mm')
              : null,
          },
        };
        setOrder(orderReceived);
      });
    }

    return () => {
      clearInterval(timer);
    };
  }, [restaurant, socket, dispatch]);

  const handleClose = useCallback(() => {
    setOrder(null);
  }, []);

  function handleLogout() {
    auth.logout().then(() => {
      socket.disconnect();
      history.push('/login');
    });
  }

  return (
    <>
      {loading ? (
        <InsideLoading />
      ) : (
        <>
          {order ? (
            <Print handleClose={handleClose} order={order} />
          ) : (
            <div className={classes.container}>
              <Typography variant="h4">{restaurant.name}</Typography>
              <Typography variant="body1" color="textSecondary">
                {user.name}
              </Typography>
              <RestaurantStatus wsConnected={wsConnected} />
              <Button color="primary" variant="text" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
