import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'store/selector';
import InsideLoading from 'components/loading/InsideLoading';
import { useAuth } from 'providers/auth';
import { api } from 'services/api';
import Shipment from 'components/print/Shipment';
import PrintByProduct from 'components/print/PrintByProduct';
import Print from 'components/print/Print';
import PrintOnlyShipment from 'components/print/PrintOnlyShipment';
import Status from '../status/Status';
import { history } from 'services/history';
import { OrderData } from 'types/order';
import { useFormarOrder } from 'hooks/useFormatOrder';
import { useSocket } from 'hooks/useSocket';

const Home: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [toPrint, setToPrint] = useState<OrderData | null>(null);
  const [shipment, setShipment] = useState<OrderData | null>(null);
  const restaurant = useSelector(state => state.restaurant);
  const auth = useAuth();
  const formatOrder = useFormarOrder();
  const [socket, wsConnected] = useSocket(setOrders, setShipment);

  useEffect(() => {
    async function getOrders() {
      try {
        const response = await api.get('/orders/print/list');
        if (response.data.length > 0) {
          const formattedOrders = response.data.map((order: OrderData) => formatOrder(order));
          setOrders(oldOrders => [...oldOrders, ...formattedOrders]);
        }
      } catch (err) {
        console.log(err);
      }
    }

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

  if (auth.loading) return <InsideLoading />;

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
};

export default Home;
