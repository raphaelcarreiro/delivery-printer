import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  formatRelative,
  parseISO,
  formatDistanceStrict,
  format,
} from 'date-fns';
import ptbr from 'date-fns/locale/pt-BR';
import Print from './print/Print';
import { api } from '../services/api';
import styles from './Home.css';
import { moneyFormat } from '../helpers/NumberFormat';

interface Restaurant {
  name: string;
}

export interface Order {
  id: number;
  restaurant_id: number;
}

const socket: SocketIOClient.Socket = io.connect('http://localhost:3333/admin');

export default function Home(): JSX.Element {
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant>({} as Restaurant);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    api
      .get('/restaurants')
      .then((response) => {
        setRestaurant(response.data);
        return true;
      })
      .finally(() => {
        setloading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function formatId(id) {
    return `#${`00000${id}`.slice(-6)}`;
  }

  useEffect(() => {
    if (socket.disconnected) socket.connect();
    socket.emit('register', 1);

    socket.on('reconnect', () => {
      socket.emit('register', 1);
    });

    socket.on('stored', (order) => {
      const date = parseISO(order.created_at);
      const orderReceived = {
        ...order,
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
      setOrder(orderReceived);
    });
  }, []);

  function handleClose() {
    setOrder(null);
  }

  return (
    <>
      {order && <Print handleClose={handleClose} order={order} />}
      <div className={styles.container} data-tid="container">
        {loading ? (
          <p>Carregando</p>
        ) : (
          <>
            <p>
              Impressão de pedidos,
              {restaurant.name}
            </p>
          </>
        )}
      </div>
    </>
  );
}
