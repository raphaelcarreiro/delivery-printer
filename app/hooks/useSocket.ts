import constants from 'constants/constants';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormarOrder } from './useFormatOrder';
import { Socket, io } from 'socket.io-client/dist/socket.io';
import { useSelector } from 'store/selector';
import { useDispatch } from 'react-redux';
import { OrderData } from 'types/order';
import { setRestaurantIsOpen } from 'store/modules/restaurant/actions';
import { BoardControlMovement } from 'types/boardControlMovement';

const socket: Socket = io(constants.WS_BASE_URL);

type UseSocket = [Socket, boolean];

let timer;

export function useSocket(
  setOrders: Dispatch<SetStateAction<OrderData[]>>,
  setShipment: Dispatch<SetStateAction<OrderData | null>>,
  setBoardMovement: Dispatch<SetStateAction<BoardControlMovement | null>>,
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

      setOrders(state => {
        const exist = state.some(item => item.id === order.id);

        if (exist) {
          return state;
        }

        return [...state, formattedOrder];
      });
    });

    socket.on('printOrder', (order: OrderData) => {
      const formattedOrder = formatOrder(order);

      setOrders(state => {
        const exist = state.some(item => item.id === order.id);

        if (exist) {
          return state;
        }

        return [...state, formattedOrder];
      });
    });

    socket.on('print_board_billing', (movement: BoardControlMovement) => {
      setBoardMovement(movement);
    });

    socket.on('handleRestaurantState', (response: { isOpen: boolean }) => {
      dispatch(setRestaurantIsOpen(response.isOpen));
    });

    return () => {
      socket.off('handleRestaurantState');
      socket.off('printShipment');
      socket.off('printOrder');
      socket.off('stored');
      socket.off('print_board_billing');
    };
  }, [restaurant, dispatch, formatOrder, setOrders, setBoardMovement]);

  useEffect(() => {
    if (!restaurant?.configs?.print_only_shipment) {
      socket.on('printShipment', (order: OrderData) => {
        const formattedOrder = formatOrder(order);
        setShipment(formattedOrder);
      });
    }

    if (restaurant && connected) {
      socket.emit('register', restaurant.id);
      socket.emit('printer_ping', restaurant.id);

      timer = setInterval(() => {
        socket.emit('printer_ping', restaurant.id);
      }, 30000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [connected, restaurant, setShipment, formatOrder]);

  return [socket, connected];
}
