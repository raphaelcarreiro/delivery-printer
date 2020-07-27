import React, { ChangeEvent } from 'react';
import {
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ForgotPassword from 'components/login/ForgotPassword';

const useStyles = makeStyles({
  action: {
    marginTop: 20,
  },
  arrowBackIcon: {
    position: 'absolute',
    top: 10,
  },
  input: {
    boxSizing: 'border-box',
  },
});

interface PasswordStepProps {
  login: {
    name: string;
    email: string;
    password: string;
  };
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  loading: boolean;
  showPassword: boolean;
  handlePasswordVisibility(): void;
  handleStepBack(): void;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  login,
  handleChange,
  handleStepBack,
  showPassword,
  handlePasswordVisibility,
  loading,
}) => {
  const classes = useStyles();

  return (
    <>
      <IconButton
        color="primary"
        className={classes.arrowBackIcon}
        onClick={handleStepBack}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography align="center" color="primary">
        Seja bem-vindo {login.name}.
      </Typography>
      <TextField
        variant="outlined"
        margin="normal"
        label="Senha"
        placeholder="Informe sua senha"
        fullWidth
        value={login.password}
        onChange={handleChange}
        name="password"
        type={showPassword ? 'text' : 'password'}
        required
        autoComplete="current-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton color="primary" onClick={handlePasswordVisibility}>
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
          classes: { root: classes.input },
        }}
        autoFocus
      />
      <input
        type="hidden"
        autoComplete="email username"
        name="username"
        value={login.email}
      />
      <div className={classes.action}>
        <Button
          disabled={loading}
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Entrar
        </Button>
      </div>
    </>
  );
};

export default PasswordStep;
