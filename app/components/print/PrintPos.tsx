import React, { useEffect, useState, Fragment } from 'react';
import { makeStyles } from '@material-ui/styles';
import { OrderData, PrinterData } from 'components/home/types';
import { Typography } from '@material-ui/core';
import { api } from 'services/api';
import { PosPrintOptions, PosPrintData } from 'electron-pos-printer';
import { remote } from 'electron';
import Complements from './Complements';

const { PosPrinter } = remote.require('electron-pos-printer');

const useStyles = makeStyles({
  container: {
    maxWidth: 300,
    padding: '15px 15px 30px 15px',
    // padding: 15,
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
  products: {
    padding: '10px 0 0',
    borderTop: '1px dashed #333',
  },
  complement: {
    marginLeft: 6,
  },
  additional: {
    marginRight: 6,
  },
  ingredient: {
    marginRight: 6,
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
    paddingBottom: 10,
  },
  productAmount: {
    minWidth: 25,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 600,
    marginBottom: 10,
  },
  complementCategory: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr',
    alignItems: 'center',
  },
});

interface PrintProps {
  handleClose(): void;
  order: OrderData;
}

const PrintPos: React.FC<PrintProps> = ({ handleClose, order }) => {
  const classes = useStyles();
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [toPrint, setToPrint] = useState<PrinterData[]>([]);

  // close if there is not printer in product
  useEffect(() => {
    const check = order.products.some(product => product.printer);
    if (!check) handleClose();
  }, [handleClose, order]);

  // get product printers
  useEffect(() => {
    if (order) {
      let productPrinters: PrinterData[] = [];
      order.products.forEach(product => {
        if (product.printer) {
          if (!productPrinters.some(printer => printer.id === product.printer.id))
            productPrinters.push(product.printer);
        }
      });

      productPrinters = productPrinters.map(_printer => {
        _printer.order = {
          ...order,
          products: order.products.filter(product => {
            return product.printer && product.printer.id === _printer.id;
          }),
        };
        _printer.printed = false;
        return _printer;
      });

      setPrinters(productPrinters);
    }
  }, [order]);

  useEffect(() => {
    async function setPrinted() {
      try {
        await api().post(`/orders/printed`, { order_id: order.id });
        console.log(`Alterado situação do pedido ${order.id}`);
        handleClose();
      } catch (err) {
        console.log(err);
        handleClose();
      }
    }

    if (printers.length > 0) {
      const tp = printers.find(p => !p.printed);

      // close if all order products had been printed
      if (!tp) {
        const check = printers.every(p => p.printed);
        if (check) setPrinted();
        return;
      }

      setToPrint([tp]);
    }
  }, [printers, handleClose, order]);

  // print
  useEffect(() => {
    if (!toPrint.length) return;
    const [printing] = toPrint;

    const options: PosPrintOptions = {
      preview: false,
      width: '80mm',
      margin: '0 0 0 0',
      copies: 1,
      printerName: printing.name,
      timeOutPerLine: 2000,
      pageSize: { height: 301000, width: 80000 },
      silent: true,
    };

    const data: PosPrintData[] = [
      {
        type: 'text',
        value: `PEDIDO ${order.formattedId}`,
        css: { 'font-weight': '700', 'font-size': '18px' },
      },
      {
        type: 'text',
        value: order.formattedDate,
        css: { 'font-size': '18px' },
      },
      {
        type: 'text',
        value: order.customer.name,
        css: { 'font-size': '18px' },
      },
      {
        type: 'text',
        value: `${order.shipment.address}, ${order.shipment.number}, ${order.shipment.district}`,
        css: { 'font-size': '18px' },
      },
      {
        type: 'text',
        value: `.`,
      },
    ];

    PosPrinter.print(data, options)
      .then(() => {
        setPrinters(oldPrinters =>
          oldPrinters.map(p => {
            if (p.id === printing.id) p.printed = true;
            return p;
          }),
        );
      })
      .catch(error => {
        console.error(error);
      });
  }, [toPrint, handleClose]);

  return (
    <>
      {toPrint.length > 0 &&
        toPrint.map(printer => (
          <div className={classes.container} key={printer.id}>
            <Typography variant="h6" className={classes.title} gutterBottom>
              PEDIDO {order.formattedId}
            </Typography>
            <Typography>{order.formattedDate}</Typography>
            <Typography gutterBottom>{order.customer.name}</Typography>
            {order.shipment.shipment_method === 'delivery' && (
              <Typography variant="body2">
                {order.shipment.address}, {order.shipment.number}, {order.shipment.district}
              </Typography>
            )}
            {order.shipment.shipment_method === 'customer_collect' && !order.shipment.scheduled_at ? (
              <Typography>**Cliente retira**</Typography>
            ) : (
              order.shipment.scheduled_at && (
                <Typography>**Cliente retira ás {order.shipment.formattedScheduledAt}**</Typography>
              )
            )}
            <table className={classes.headerProducts}>
              <tbody>
                <tr>
                  <td style={{ minWidth: 30 }}>
                    <Typography>Qtd</Typography>
                  </td>
                  <td>
                    <Typography>Item</Typography>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className={classes.products}>
              <table>
                <tbody>
                  {printer.order.products.map(product => (
                    <tr key={product.id}>
                      <td className={classes.productAmount}>
                        <Typography>{product.amount}x</Typography>
                      </td>
                      <td className={classes.product}>
                        <Typography className={classes.productName}>{product.name}</Typography>
                        {product.annotation && <Typography variant="body2">Obs: {product.annotation}</Typography>}
                        {product.additional.length > 0 && (
                          <>
                            {product.additional.map(additional => (
                              <Typography
                                display="inline"
                                variant="body2"
                                className={classes.additional}
                                key={additional.id}
                              >
                                c/ {additional.amount}x {additional.name}
                              </Typography>
                            ))}
                          </>
                        )}
                        {product.ingredients.length > 0 && (
                          <>
                            {product.ingredients.map(ingredient => (
                              <Typography
                                display="inline"
                                variant="body2"
                                className={classes.ingredient}
                                key={ingredient.id}
                              >
                                s/ {ingredient.name}
                              </Typography>
                            ))}
                          </>
                        )}
                        {product.complement_categories.length > 0 && (
                          <>
                            {product.complement_categories.map(category => (
                              <Fragment key={category.id}>
                                {category.complements.length > 0 && (
                                  <div className={classes.complementCategory}>
                                    <Typography variant="body2">{category.print_name || category.name}</Typography>
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
          </div>
        ))}
    </>
  );
};

export default PrintPos;
