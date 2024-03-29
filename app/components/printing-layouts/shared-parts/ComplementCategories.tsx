import React, { FC, Fragment } from 'react';
import PrintTypography from 'components/base/print-typography/PrintTypography';
import Complements from './Complements';
import { ComplementCategory } from 'types/order';
import { makeStyles } from '@material-ui/core';

const styles = makeStyles({
  complementCategory: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: 5,
    borderBottom: '1px dashed #000',
  },
});

interface ComplementCategoriesProps {
  categories: ComplementCategory[];
}

const ComplementCategories: FC<ComplementCategoriesProps> = ({ categories }) => {
  const classes = styles();

  return (
    <>
      {categories.map(category => (
        <Fragment key={category.id}>
          {category.complements.length > 0 && (
            <div className={classes.complementCategory}>
              <PrintTypography italic>{category.print_name || category.name}</PrintTypography>
              <Complements complementCategory={category} />
            </div>
          )}
        </Fragment>
      ))}
    </>
  );
};

export default ComplementCategories;
