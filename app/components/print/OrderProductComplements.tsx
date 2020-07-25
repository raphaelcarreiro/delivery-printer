import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import { ComplementCategory } from '../home/Home';

const useStyles = makeStyles({
  ingredient: {
    marginRight: 6,
  },
  complementName: {
    fontSize: 15,
    display: 'inline',
    fontWeight: 400,
  },
});

interface OrderProductComplementProps {
  complementCategory: ComplementCategory;
}

const OrderProductComplements: React.FC<OrderProductComplementProps> = ({
  complementCategory,
}) => {
  const classes = useStyles();

  return (
    <div>
      {complementCategory.complements.map((complement, index) => (
        <div
          key={complement.id}
          style={
            complement.additional.length > 0 ||
            complement.ingredients.length > 0
              ? { display: 'block' }
              : { display: 'inline-flex' }
          }
        >
          <span className={classes.complementName} key={complement.id}>
            {complement.name}
            {index !== complementCategory.complements.length - 1 && ', '}
          </span>
          <div>
            {complement.additional.map((additional) => (
              <Typography
                display="inline"
                variant="caption"
                className={classes.ingredient}
                key={additional.id}
              >
                c/ {additional.name}
              </Typography>
            ))}
            {complement.ingredients.map((ingredient) => (
              <Typography
                display="inline"
                variant="caption"
                className={classes.ingredient}
                key={ingredient.id}
              >
                s/ {ingredient.name}
              </Typography>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderProductComplements;
