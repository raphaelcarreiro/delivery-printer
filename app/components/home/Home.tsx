import React, { useEffect, useState, useCallback } from 'react';
import { parseISO, formatDistanceStrict, format } from 'date-fns';
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
import PrintByProduct from 'components/print/PrintByProduct';
import Print from 'components/print/Print';
import PrintOnlyShipment from 'components/print/PrintOnlyShipment';
import { moneyFormat } from '../../helpers/NumberFormat';
import { OrderData } from './types';
import Status from './Status';

const socket: SocketIOClient.Socket = io.connect(constants.WS_BASE_URL);

export default function Home(): JSX.Element {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [toPrint, setToPrint] = useState<OrderData | null>(null);
  const [shipment, setShipment] = useState<OrderData | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const restaurant = useSelector(state => state.restaurant);
  const dispatch = useDispatch();
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
      formattedDate: format(date, "PP 'ás' p", { locale: ptbr }),
      formattedSubtotal: moneyFormat(order.subtotal),
      formattedDiscount: moneyFormat(order.discount),
      formattedTax: moneyFormat(order.tax),
      dateDistance: formatDistanceStrict(date, new Date(), {
        locale: ptbr,
        roundingMethod: 'ceil',
      }),
      products: order.products.map(product => {
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
        if (response.data.length > 0) {
          const formattedOrders = response.data.map((order: OrderData) => formatOrder(order));
          setOrders(oldOrders => [...oldOrders, ...formattedOrders]);
        }
      } catch (err) {
        console.log(err);
      }
    }

    // a cada 1 minuto verifica se existe pedidos para imprimir
    const timer = setInterval(getOrders, 18000);

    return () => {
      clearInterval(timer);
    };
  }, [formatOrder]);

  useEffect(() => {
    if (orders.length > 0) {
      const tp = orders.find(order => !order.printed);

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

    if (!restaurant) return;

    if (socket.disconnected) socket.connect();
    setWsConnected(socket.connected);

    socket.emit('register', restaurant.id);

    socket.on('reconnect', () => {
      socket.emit('register', restaurant.id);
    });

    socket.on('stored', (order: OrderData) => {
      const formattedOrder = formatOrder(order);
      setOrders(oldOrders => [...oldOrders, formattedOrder]);
    });

    socket.on('printOrder', (order: OrderData) => {
      const formattedOrder = formatOrder(order);
      setOrders(oldOrders => [...oldOrders, formattedOrder]);
    });

    if (!restaurant.configs.print_only_shipment)
      socket.on('printShipment', (order: OrderData) => {
        const formattedOrder = formatOrder(order);
        setShipment(formattedOrder);
      });

    socket.on('handleRestaurantState', (response: { isOpen: boolean }) => {
      dispatch(setRestaurantIsOpen(response.isOpen));
    });

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, [restaurant, dispatch, formatOrder]);

  const handleOrderClose = useCallback(() => {
    if (toPrint)
      setOrders(oldOrders =>
        oldOrders.map(order => {
          if (order.id === toPrint.id) order.printed = true;
          return order;
        }),
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

  if (loading) return <InsideLoading />;

  return (
    <>
      {toPrint && !toPrint.printed ? (
        restaurant?.configs.print_by_product ? (
          <PrintByProduct handleClose={handleOrderClose} order={toPrint} />
        ) : restaurant?.configs.print_only_shipment ? (
          <PrintOnlyShipment order={toPrint} handleClose={handleOrderClose} />
        ) : (
          <Print handleClose={handleOrderClose} order={toPrint} />
        )
      ) : shipment && !shipment.printed ? (
        <Shipment order={shipment} handleClose={handleShipmentClose} />
      ) : (
        <Status wsConnected={wsConnected} handleLogout={handleLogout} />
      )}
    </>
  );
}
