import React, { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  wrapperContainer: {
    display: 'flex',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  contentWrapperLogin: {
    width: '100%',
    transitionDuration: '225ms',
    paddingLeft: 0,
    overflowY: 'auto',
    position: 'relative',
    paddingTop: 0,
  },
  content: {
    minHeight: 'calc(100vh - 104px)',
    padding: '20px 30px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      padding: '15px 20px',
    },
  },
}));

type Props = {
  children: ReactNode;
};

export default function LayoutNoSidebar(props: Props) {
  const classes = useStyles();
  const { children } = props;

  return (
    <div className={classes.wrapperContainer}>
      <div id="content-wrapper" className={classes.contentWrapperLogin}>
        <div id="app-content" className={classes.content}>
          {children}
        </div>
      </div>
    </div>
  );
}