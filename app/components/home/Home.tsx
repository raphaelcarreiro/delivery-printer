import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  formatRelative,
  parseISO,
  formatDistanceStrict,
  format,
} from 'date-fns';
import ptbr from 'date-fns/locale/pt-BR';
import { useSelector } from 'store';
import { Typography } from '@material-ui/core';
import { useApp } from 'containers/App';
import InsideLoading from 'components/loading/InsideLoading';
import io from 'socket.io-client';
import Print from '../print/Print';
import { moneyFormat } from '../../helpers/NumberFormat';

export interface PrinterData {
  id: number;
  name: string;
  order: OrderData;
  printed?: boolean;
}

interface Additional {
  id: number;
  name: string;
}

interface Ingredient {
  id: number;
  name: string;
}

export interface ComplementCategory {
  id: number;
  name: string;
  complements: Complement[];
}

interface Complement {
  id: number;
  name: string;
  additional: ComplementAdditional[];
  ingredients: ComplementIngredient[];
}

type ComplementAdditional = Additional;
type ComplementIngredient = Ingredient;

interface Product {
  id: number;
  name: string;
  final_price: number;
  price: number;
  formattedFinalPrice: string;
  formattedPrice: string;
  printer: PrinterData;
  amount: number;
  annotation: string;
  additional: Additional[];
  ingredients: Ingredient[];
  complement_categories: ComplementCategory[];
}

interface Shipment {
  id: number;
  address: string;
  formattedScheduledAt: string | null;
  scheduled_at: string | null;
  shipment_method: string;
}

interface Customer {
  name: string;
}

export interface OrderData {
  id: number;
  formattedId: string;
  formattedTotal: string;
  formattedChange: string;
  formattedDate: string;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTax: string;
  dateDistance: string;
  total: number;
  change: number;
  subtotal: number;
  discount: number;
  tax: number;
  created_at: string;
  products: Product[];
  shipment: Shipment;
  customer: Customer;
}

const baseUrl = 'http://localhost:3333/admin';
// const baseUrl = 'https://api-node.topnfe.com.br/admin';

export default function Home(): JSX.Element {
  const [order, setOrder] = useState<OrderData | null>(null);
  const restaurant = useSelector((state) => state.restaurant);
  const user = useSelector((state) => state.user);
  const { loading } = useApp();
  const socket = useMemo(() => io.connect(baseUrl), []);

  function formatId(id: number) {
    return `#${`00000${id}`.slice(-6)}`;
  }

  useEffect(() => {
    if (restaurant.id) {
      if (socket.disconnected) socket.connect();
      socket.emit('register', restaurant.id);
      console.log(socket.connected);
      console.log('Conectado ao socket');

      socket.on('reconnect', () => {
        socket.emit('register', restaurant.id);
        console.log('Reconectado ao socket');
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
  }, [restaurant, socket]);

  const handleClose = useCallback(() => {
    setOrder(null);
  }, []);

  return (
    <>
      {loading ? (
        <InsideLoading />
      ) : (
        <>
          {order ? (
            <Print handleClose={handleClose} order={order} />
          ) : (
            <div>
              <Typography variant="h5">{restaurant.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                Olá {user.name}
              </Typography>
            </div>
          )}
        </>
      )}
    </>
  );
}
