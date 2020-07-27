import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Grid, Typography, CircularProgress } from '@material-ui/core';
import UsernameStep from 'components/login/UsernameStep';
import PasswordStep from 'components/login/PasswordStep';
import { makeStyles } from '@material-ui/core/styles';
import { useAuth } from 'hooks/auth';
import { history } from 'store';
import { useMessaging } from 'hooks/messaging';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'fixed',
  },
  paper: {
    padding: '0 20px',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    position: 'relative',
  },
  form: {
    width: '100%',
  },
  loadingWrap: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  appName: {
    marginTop: 10,
  },
  logo: {
    marginBottom: 30,
  },
  description: {
    marginBottom: 30,
    textAlign: 'center',
  },
});

const Login: React.FC = () => {
  const classes = useStyles({
    src: '/images/background.jpg',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const messaging = useMessaging();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated()) history.push('/');
  }, [auth]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 'email') {
      setLoading(true);

      auth
        .checkEmail(email)
        .then((response) => {
          setName(response.name);
          setStep('password');
          messaging.handleClose();
        })
        .catch((err) => {
          messaging.handleOpen(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(true);

      auth
        .login(email, password)
        .then(() => {
          setLoading(false);
          history.push('/');
        })
        .catch((err) => {
          messaging.handleOpen(err.message);
          setLoading(false);
        });
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.name === 'email') setEmail(event.target.value);
    else setPassword(event.target.value);
  }

  function handleStepBack() {
    setStep('email');
  }

  function handlePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <>
      <div className={classes.container}>
        <Grid item xs={12} sm={8} md={6} lg={3} xl={3}>
          <div className={classes.paper}>
            {loading && (
              <div className={classes.loadingWrap}>
                <CircularProgress color="secondary" />
              </div>
            )}
            <div className={classes.description}>
              <Typography variant="h5">Delivery Printer</Typography>
              <Typography variant="body2">
                Impressão automática de pedidos
              </Typography>
            </div>
            <form onSubmit={handleSubmit}>
              {step === 'email' ? (
                <UsernameStep
                  handleChange={handleChange}
                  email={email}
                  loading={loading}
                />
              ) : (
                <PasswordStep
                  handleChange={handleChange}
                  login={{ email, password, name }}
                  showPassword={showPassword}
                  handleStepBack={handleStepBack}
                  handlePasswordVisibility={handlePasswordVisibility}
                  loading={loading}
                />
              )}
            </form>
          </div>
        </Grid>
      </div>
    </>
  );
};

export default Login;
