import React, { useEffect, useState, Fragment } from 'react';
import { remote } from 'electron';
import { makeStyles } from '@material-ui/styles';
import {
  OrderData,
  PrinterData,
  ProductPrinterData,
} from 'components/home/types';
import { Typography } from '@material-ui/core';
import { api } from 'services/api';
import Complements from './Complements';

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

const PrintByProduct: React.FC<PrintProps> = ({ handleClose, order }) => {
  const classes = useStyles();
  const [products, setProducts] = useState<ProductPrinterData[]>([]);
  const [toPrint, setToPrint] = useState<ProductPrinterData[]>([]);

  // close if there is not printer in product
  useEffect(() => {
    const check = order.products.some((product) => product.printer);
    if (!check) handleClose();
  }, [handleClose, order]);

  // get product printers
  useEffect(() => {
    if (!order) return;

    let productsToPrint: ProductPrinterData[] = [];
    order.products.forEach((product) => {
      if (product.printer) {
        let i = 1;
        do {
          productsToPrint.push({
            id: `${product.id}-${i}`,
            productId: product.id,
            name: product.printer.name,
            order,
            printed: false,
            currentAmount: i,
          });
          i += 1;
        } while (i <= product.amount);
      }
    });

    productsToPrint = productsToPrint.map((productToPrint) => {
      productToPrint.order = {
        ...order,
        products: order.products.filter(
          (product) =>
            product.printer && product.id === productToPrint.productId
        ),
      };
      productToPrint.printed = false;
      return productToPrint;
    });

    setProducts(productsToPrint);
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

    if (products.length > 0) {
      const tp = products.find((p) => !p.printed);

      // close if all order products had been printed
      if (!tp) {
        const check = products.every((p) => p.printed);
        if (check) setPrinted();
        return;
      }

      setToPrint([tp]);
    }
  }, [products, handleClose, order]);

  // print
  useEffect(() => {
    if (toPrint.length > 0) {
      const [win] = remote.BrowserWindow.getAllWindows();
      const [printing] = toPrint;

      if (!win) return;

      let error = false;

      try {
        win.webContents.print(
          {
            deviceName: printing.name,
            color: false,
            collate: false,
            copies: 1,
            silent: true,
            margins: {
              marginType: 'none',
            },
          },
          (success) => {
            if (success) {
              setProducts((oldValue) =>
                oldValue.map((p) => {
                  if (p.id === printing.id) p.printed = true;
                  return p;
                })
              );
            }
          }
        );
      } catch (err) {
        console.log(err);
        error = true;
      }

      // try to print in default printer
      if (error) {
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
              if (success) {
                setProducts((oldValue) =>
                  oldValue.map((p) => {
                    if (p.id === printing.id) p.printed = true;
                    return p;
                  })
                );
              }
            }
          );
        } catch (err) {
          console.log(err);
          handleClose();
        }
      }
    }
  }, [toPrint, handleClose]);

  return (
    <>
      {toPrint.length > 0 &&
        toPrint.map((printer) => (
          <div className={classes.container} key={printer.id}>
            <Typography variant="h6" className={classes.title} gutterBottom>
              PEDIDO {order.formattedId}
            </Typography>
            <Typography>{order.formattedDate}</Typography>
            <Typography gutterBottom>{order.customer.name}</Typography>
            {order.shipment.shipment_method === 'delivery' && (
              <Typography variant="body2">
                {order.shipment.address}, {order.shipment.number},{' '}
                {order.shipment.district}
              </Typography>
            )}
            {order.shipment.shipment_method === 'customer_collect' &&
            !order.shipment.scheduled_at ? (
              <Typography>**Cliente retira**</Typography>
            ) : (
              order.shipment.scheduled_at && (
                <Typography>
                  **Cliente retira ás {order.shipment.formattedScheduledAt}**
                </Typography>
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
                  {printer.order.products.map((product) => (
                    <tr key={product.id}>
                      <td className={classes.productAmount}>
                        <Typography>
                          {printer.currentAmount}/{product.amount}
                        </Typography>
                      </td>
                      <td className={classes.product}>
                        <Typography className={classes.productName}>
                          {product.name}
                        </Typography>
                        {product.annotation && (
                          <Typography variant="body2">
                            Obs: {product.annotation}
                          </Typography>
                        )}
                        {product.additional.length > 0 && (
                          <>
                            {product.additional.map((additional) => (
                              <Typography
                                display="inline"
                                variant="body2"
                                className={classes.additional}
                                key={additional.id}
                              >
                                c/ {additional.name}
                              </Typography>
                            ))}
                          </>
                        )}
                        {product.ingredients.length > 0 && (
                          <>
                            {product.ingredients.map((ingredient) => (
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
                            {product.complement_categories.map((category) => (
                              <Fragment key={category.id}>
                                {category.complements.length > 0 && (
                                  <div className={classes.complementCategory}>
                                    <Typography variant="body2">
                                      {category.name}
                                    </Typography>
                                    <Complements
                                      complementCategory={category}
                                    />
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

export default PrintByProduct;
