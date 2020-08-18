import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  formatRelative,
  parseISO,
  formatDistanceStrict,
  format,
} from 'date-fns';
import ptbr from 'date-fns/locale/pt-BR';
import { useSelector, history } from 'store';
import { useApp } from 'containers/App';
import InsideLoading from 'components/loading/InsideLoading';
import io from 'socket.io-client';
import { useAuth } from 'hooks/auth';
import constants from 'constants/url';
import { useDispatch } from 'react-redux';
import { setRestaurantIsOpen } from 'store/modules/restaurant/actions';
import { api } from 'services/api';
import Shipment from 'components/print/Shipment';
import Print from '../print/Print';
import { moneyFormat } from '../../helpers/NumberFormat';
import { OrderData } from './types';
import Status from './Status';

export default function Home(): JSX.Element {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [toPrint, setToPrint] = useState<OrderData | null>(null);
  const [shipment, setShipment] = useState<OrderData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const restaurant = useSelector((state) => state.restaurant);
  const dispatch = useDispatch();
  const socket = useMemo(() => io.connect(constants.WS_BASE_URL), []);
  const { loading } = useApp();
  const auth = useAuth();

  function formatId(id: number) {
    return `#${`00000${id}`.slice(-6)}`;
  }

  const formatOrder = useCallback((order: OrderData) => {
    const date = parseISO(order.created_at);
    return {
      ...order,
      printed: false,
      formattedId: formatId(order.id),
      formattedTotal: moneyFormat(order.total),
      formattedChange: moneyFormat(order.change - order.total),
      formattedChangeTo: moneyFormat(order.change),
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
  }, []);

  useEffect(() => {
    async function getOrders() {
      try {
        const response = await api().get('/orders/print/list');
        setOrders(response.data.map((order: OrderData) => formatOrder(order)));
      } catch (err) {
        console.log(err);
      }
    }

    // a cada 1 minuto verifica se existe pedidos para imprimir
    const timer = setInterval(getOrders, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [formatOrder]);

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

      socket.on('printOrder', (order: OrderData) => {
        const formattedOrder = formatOrder(order);
        setOrders([formattedOrder]);
      });

      socket.on('printShipment', (order: OrderData) => {
        const formattedOrder = formatOrder(order);
        setShipment(formattedOrder);
      });

      socket.on('handleRestaurantState', (response: { isOpen: boolean }) => {
        dispatch(setRestaurantIsOpen(response.isOpen));
      });
    }

    return () => {
      clearInterval(timer);
    };
  }, [restaurant, socket, dispatch, formatOrder]);

  const handleOrderClose = useCallback(() => {
    if (toPrint)
      setOrders((oldOrders) =>
        oldOrders.map((order) => {
          if (order.id === toPrint.id) order.printed = true;
          return order;
        })
      );
  }, [toPrint]);

  const handleShipmentClose = useCallback(() => {
    if (shipment) setShipment(null);
  }, [shipment]);

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
          {toPrint && !toPrint.printed ? (
            <Print handleClose={handleOrderClose} order={toPrint} />
          ) : shipment && !shipment.printed ? (
            <Shipment order={shipment} handleClose={handleShipmentClose} />
          ) : (
            <Status wsConnected={wsConnected} handleLogout={handleLogout} />
          )}
        </>
      )}
    </>
  );
}
