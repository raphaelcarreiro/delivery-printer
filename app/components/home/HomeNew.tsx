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
import { api } from 'services/api';
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
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [toPrint, setToPrint] = useState<OrderData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const restaurant = useSelector((state) => state.restaurant);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const socket = useMemo(() => io.connect(constants.WS_BASE_URL), []);
  const { loading } = useApp();
  const classes = useStyles();
  const auth = useAuth();

  function formatId(id: number) {
    return `#${`00000${id}`.slice(-6)}`;
  }

  useEffect(() => {
    async function getOrders() {
      try {
        const response = await api().get('/orders/print/list');
        setOrders(
          response.data.map((order: OrderData) => {
            const date = parseISO(order.created_at);
            return {
              ...order,
              printed: false,
              formattedId: formatId(order.id),
              formattedTotal: moneyFormat(order.total),
              formattedChange: moneyFormat(order.change - order.total),
              formattedDate: formatRelative(date, new Date(), { locale: ptbr }),
              formattedSubtotal: moneyFormat(order.subtotal),
              formattedDiscount: moneyFormat(order.discount),
              formattedTax: moneyFormat(order.tax),
              dateDistance: formatDistanceStrict(date, new Date(), {
                locale: ptbr,
                roundingMethod: 'ceil',
              }),
              products: order.products.map((product) => {
                product.formattedFinalPrice = moneyFormat(product.final_price);
                product.formattedPrice = moneyFormat(product.price);
                return product;
              }),
              shipment: {
                ...order.shipment,
                formattedScheduledAt: order.shipment.scheduled_at
                  ? format(parseISO(order.shipment.scheduled_at), 'HH:mm')
                  : null,
              },
            };
          })
        );
      } catch (err) {
        console.log(err);
      }
    }

    const timer = setInterval(getOrders, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const tp = orders.find((order) => !order.printed);

      if (!tp) {
        setOrders([]);
        setToPrint(null);
        return;
      }

      setToPrint(tp);
    }
  }, [orders]);

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
    }

    return () => {
      clearInterval(timer);
    };
  }, [restaurant, socket, dispatch]);

  const handleClose = useCallback(() => {
    if (toPrint)
      setOrders((oldOrders) =>
        oldOrders.map((order) => {
          if (order.id === toPrint.id) order.printed = true;
          return order;
        })
      );
  }, [toPrint]);

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
          {toPrint && toPrint.printed === false ? (
            <Print handleClose={handleClose} order={toPrint} />
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
