import React, { useEffect, useState } from 'react';
import { remote } from 'electron';
import { makeStyles } from '@material-ui/styles';
import Dialog from '../dialog/Dialog';
import OrderProductComplements from './OrderProductComplements';

const useStyles = makeStyles({
  container: {
    maxWidth: 300,
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
  },
  complementCategory: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1fr',
    alignItems: 'center',
  },
});

interface PrintProps {
  handleClose(): void;
  order: {
    id: number;
  };
}

const Print: React.FC<PrintProps> = ({ handleClose, order }) => {
  const classes = useStyles();
  const [printers, setPrinters] = useState([]);

  useEffect(() => {
    if (order) {
      let printers = [];
      order.products.forEach((product) => {
        if (product.printer) {
          if (!printers.some((printer) => printer.id === product.printer.id))
            printers.push(product.printer);
        }
      });

      printers = printers.map((printer) => {
        printer.order = {
          ...order,
          products: order.products.filter((product) => {
            return product.printer && product.printer.id === printer.id;
          }),
        };
        return printer;
      });

      setPrinters(printers);
    }
  }, [order]);

  useEffect(() => {
    if (printers.length > 0) {
      const [win] = remote.BrowserWindow.getAllWindows();

      if (!win) return;

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
        (success, failureReason) => {
          if (!success) console.log(failureReason);

          handleClose();
        }
      );
    }
  }, [printers]);

  return (
    <>
      <Dialog>
        {printers.length > 0 &&
          printers.map((printer) => (
            <div className={classes.container} key={printer.id}>
              <p className={classes.title}>
                PEDIDO
                {order.formattedId}
              </p>
              <p>{order.customer.name}</p>
              <p>{order.formattedDate}</p>
              {order.shipment.shipment_method === 'customer_collect' &&
              !order.shipment.scheduled_at ? (
                <span>**Cliente retira**</span>
              ) : (
                order.shipment.scheduled_at && (
                  <span>
                    **Cliente retira ás {order.shipment.formattedScheduledAt}
                    **
                  </span>
                )
              )}
              <table className={classes.headerProducts}>
                <tbody>
                  <tr>
                    <td style={{ minWidth: 30 }}>
                      <span>Qtd</span>
                    </td>
                    <td>
                      <span>Item</span>
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
                          <span>{product.amount}x</span>
                        </td>
                        <td className={classes.product}>
                          <span className={classes.productName}>
                            {product.name}
                          </span>
                          {product.annotation && (
                            <span variant="body2">
                              Obs:
                              {product.annotation}
                            </span>
                          )}
                          {product.additional.length > 0 && (
                            <>
                              {product.additional.map((additional) => (
                                <span
                                  display="inline"
                                  variant="body2"
                                  className={classes.additional}
                                  key={additional.id}
                                >
                                  c/ {additional.name}
                                </span>
                              ))}
                            </>
                          )}
                          {product.ingredients.length > 0 && (
                            <>
                              {product.ingredients.map((ingredient) => (
                                <span
                                  display="inline"
                                  variant="body2"
                                  className={classes.ingredient}
                                  key={ingredient.id}
                                >
                                  s/ {ingredient.name}
                                </span>
                              ))}
                            </>
                          )}
                          {product.complement_categories.length > 0 && (
                            <>
                              {product.complement_categories.map((category) => (
                                <>
                                  {category.complements.length > 0 && (
                                    <div
                                      key={category.id}
                                      className={classes.complementCategory}
                                    >
                                      <span variant="body2">
                                        {category.name}
                                      </span>
                                      <OrderProductComplements
                                        category={category}
                                      />
                                    </div>
                                  )}
                                </>
                              ))}
                            </>
                          )}
                        </td>
                        <td>
                          <span>{product.formattedFinalPrice}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </Dialog>
    </>
  );
};

export default Print;
