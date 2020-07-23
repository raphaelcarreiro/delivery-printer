import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  container: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: '#fff',
  },
});

const Dialog: React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.container}>{children}</div>
    </>
  );
};

export default Dialog;
