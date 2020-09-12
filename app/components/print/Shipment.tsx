import React, { useEffect, useState, Fragment } from 'react';
import { remote } from 'electron';
import { makeStyles } from '@material-ui/styles';
import { OrderData } from 'components/home/types';
import { Typography } from '@material-ui/core';
import Complements from './Complements';

const useStyles = makeStyles({
  container: {
    maxWidth: 300,
    minHeight: 300,
    padding: 15,
    backgroundColor: '#faebd7',
    fontSize: 14,
    border: '2px dashed #ccc',
    '& p, span, h6': {
      fontWeight: 600,
      color: '#000',
    },
    '@media print': {
      '&': {
        backgroundColor: 'transparent',
        border: 'none',
      },
    },
  },
  annotation: {
    marginLeft: 10,
  },
  products: {
    marginBottom: 15,
    padding: '10px 0',
    borderTop: '1px dashed #333',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProducts: {
    marginTop: 15,
  },
  productName: {
    textTransform: 'uppercase',
    fontSize: 16,
    fontWeight: 600,
  },
  product: {
    width: '100%',
  },
  productAmount: {
    minWidth: 30,
  },
  customerData: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr',
  },
  title: {
    fontWeight: 600,
  },
  date: {
    marginBottom: 10,
  },
  complementCategory: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr',
    alignItems: 'center',
  },
  totals: {
    display: 'grid',
    gridTemplateColumns: '0.9fr 1fr',
    '& div': {
      display: 'flex',
      alignItems: 'center',
    },
  },
});

interface PrintProps {
  handleClose(): void;
  order: OrderData;
}

const Shipment: React.FC<PrintProps> = ({ handleClose, order }) => {
  const classes = useStyles();
  const [toPrint, setToPrint] = useState<OrderData | null>(null);

  // get product printers
  useEffect(() => {
    if (order) {
      setToPrint({
        ...order,
        printed: false,
      });
    }
  }, [order]);

  // print
  useEffect(() => {
    if (toPrint) {
      // fecha se o pedido já foi impresso
      if (toPrint.printed) {
        handleClose();
        return;
      }
      const [win] = remote.BrowserWindow.getAllWindows();

      if (!win) return;

      try {
        win.webContents.print(
          {
            color: false,
            collate: false,
            copies: 1,
            silent: true,
            margins: {
              marginType: 'none',
            },
          },
          (success) => {
            if (success)
              setToPrint({
                ...toPrint,
                printed: true,
              });
          }
        );
      } catch (err) {
        console.log(err);
        handleClose();
      }
    }
  }, [toPrint, handleClose]);

  return (
    <>
      {toPrint && !toPrint.printed && (
        <div className={classes.container}>
          <Typography gutterBottom variant="h6" className={classes.title}>
            PEDIDO {order.formattedId}
          </Typography>
          <Typography className={classes.date}>
            {order.formattedDate}
          </Typography>
          {order.shipment.shipment_method === 'customer_collect' &&
          !order.shipment.scheduled_at ? (
            <Typography gutterBottom>Cliente retira</Typography>
          ) : (
            order.shipment.scheduled_at && (
              <Typography gutterBottom>
                Retirada ás {order.shipment.formattedScheduledAt}
              </Typography>
            )
          )}
          <div className={classes.customerData}>
            <Typography>Cliente</Typography>
            <Typography>{order.customer.name}</Typography>
          </div>
          <div className={classes.customerData}>
            <Typography>Telefone</Typography>
            <Typography>{order.customer.phone}</Typography>
          </div>
          {order.shipment.shipment_method === 'delivery' && (
            <div className={classes.customerData}>
              <Typography>Endereço</Typography>
              <div>
                <Typography>
                  {order.shipment.address}, nº {order.shipment.number}
                </Typography>
                <Typography>{order.shipment.district}</Typography>
                <Typography>{order.shipment.complement}</Typography>
              </div>
            </div>
          )}
          <table className={classes.headerProducts}>
            <tbody>
              <tr>
                <td className={classes.productAmount}>
                  <Typography>Qtd</Typography>
                </td>
                <td className={classes.product}>
                  <Typography>Item</Typography>
                </td>
              </tr>
            </tbody>
          </table>
          <div className={classes.products}>
            <table>
              <tbody>
                {order.products.map((product) => (
                  <tr key={product.id}>
                    <td className={classes.productAmount}>
                      <Typography>{product.amount}x</Typography>
                    </td>
                    <td className={classes.product}>
                      <Typography className={classes.productName}>
                        {product.name} - {product.formattedFinalPrice}
                      </Typography>
                      {product.complement_categories.length > 0 && (
                        <>
                          {product.complement_categories.map((category) => (
                            <Fragment key={category.id}>
                              {category.complements.length > 0 && (
                                <div className={classes.complementCategory}>
                                  <Typography variant="body2">
                                    {category.name}
                                  </Typography>
                                  <Complements complementCategory={category} />
                                </div>
                              )}
                            </Fragment>
                          ))}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={classes.totals}>
            <div>
              <Typography>Pagamento</Typography>
            </div>
            <div>
              <Typography>{order.payment_method.method}</Typography>
            </div>
            {order.discount > 0 && (
              <>
                <div>
                  <Typography>Desconto</Typography>
                </div>
                <div>
                  <Typography>{order.formattedDiscount}</Typography>
                </div>
              </>
            )}
            {order.tax > 0 && (
              <>
                <div>
                  <Typography>Taxa de entrega</Typography>
                </div>
                <div>
                  <Typography>{order.formattedTax}</Typography>
                </div>
              </>
            )}
            {order.change > 0 && (
              <>
                <div>
                  <Typography>Troco para</Typography>
                </div>
                <div>
                  <Typography>{order.formattedChangeTo}</Typography>
                </div>
                <div>
                  <Typography>Troco</Typography>
                </div>
                <div>
                  <Typography>{order.formattedChange}</Typography>
                </div>
              </>
            )}
            <div>
              <Typography>Total a pagar</Typography>
            </div>
            <div>
              <Typography variant="h6">{order.formattedTotal}</Typography>
            </div>
            {order.deliverers.length > 0 && (
              <>
                {order.deliverers.map((deliverer) => (
                  <Fragment key={deliverer.id}>
                    <div>
                      <Typography>Entregador</Typography>
                    </div>
                    <div>
                      <Typography>{deliverer.name}</Typography>
                    </div>
                  </Fragment>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Shipment;
