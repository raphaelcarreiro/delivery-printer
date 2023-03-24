import constants from 'constants/constants';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormarOrder } from './useFormatOrder';
import { io } from 'socket.io-client/dist/socket.io';
import { Socket } from 'socket.io-client';
import { useSelector } from 'store/selector';
import { useDispatch } from 'react-redux';
import { OrderData } from 'types/order';
import { setRestaurantIsOpen } from 'store/modules/restaurant/actions';

const socket: Socket = io(constants.WS_BASE_URL);

type UseSocket = [Socket, boolean];

export function useSocket(
  setOrders: Dispatch<SetStateAction<OrderData[]>>,
  setShipment: Dispatch<SetStateAction<OrderData | null>>,
): UseSocket {
  const formatOrder = useFormarOrder();
  const [connected, setConnected] = useState(socket.connected);
  const restaurant = useSelector(state => state.restaurant);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('stored', (order: OrderData) => {
      const formattedOrder = formatOrder(order);
      setOrders(oldOrders => [...oldOrders, formattedOrder]);
    });

    socket.on('printOrder', (order: OrderData) => {
      const formattedOrder = formatOrder(order);
      setOrders(oldOrders => [...oldOrders, formattedOrder]);
    });

    socket.on('handleRestaurantState', (response: { isOpen: boolean }) => {
      dispatch(setRestaurantIsOpen(response.isOpen));
    });

    return () => {
      socket.off('handleRestaurantState');
      socket.off('printShipment');
      socket.off('printOrder');
      socket.off('stored');
    };
  }, [restaurant, dispatch, formatOrder]);

  useEffect(() => {
    if (!restaurant?.configs.print_only_shipment) {
      socket.on('printShipment', (order: OrderData) => {
        const formattedOrder = formatOrder(order);
        setShipment(formattedOrder);
      });
    }

    if (restaurant && connected) {
      socket.emit('register', restaurant.id);
    }
  }, [connected, restaurant]);

  return [socket, connected];
}
