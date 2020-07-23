import React from 'react';
import { makeStyles } from '@material-ui/styles';

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

const OrderProductComplements: React.FC = ({ category }) => {
  const classes = useStyles();

  return (
    <div>
      {category.complements.map((complement, index) => (
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
            {index !== category.complements.length - 1 && ', '}
          </span>
          <div>
            {complement.additional.map((additional) => (
              <span
                display="inline"
                variant="caption"
                className={classes.ingredient}
                key={additional.id}
              >
                c/ {additional.name}
              </span>
            ))}
            {complement.ingredients.map((ingredient) => (
              <span
                display="inline"
                variant="caption"
                className={classes.ingredient}
                key={ingredient.id}
              >
                s/ {ingredient.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderProductComplements;
