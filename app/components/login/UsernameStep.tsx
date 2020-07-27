import React, { ChangeEvent } from 'react';
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  action: {
    marginTop: 20,
  },
  input: {
    boxSizing: 'border-box',
  },
});

interface UserNameStepProps {
  email: string;
  handleChange(e: ChangeEvent<HTMLInputElement>): void;
  loading: boolean;
}

const UsernameStep: React.FC<UserNameStepProps> = ({
  email,
  handleChange,
  loading,
}) => {
  const classes = useStyles();
  return (
    <>
      <Typography align="center" color="primary">
        Olá. Para iniciar, digite seu e-mail.
      </Typography>
      <TextField
        variant="outlined"
        margin="normal"
        label="E-mail"
        placeholder="Digite o seu e-mail"
        fullWidth
        value={email}
        onChange={handleChange}
        name="email"
        type="email"
        required
        autoFocus
        autoComplete="email"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <PersonIcon color="primary" />
            </InputAdornment>
          ),
          classes: { root: classes.input },
        }}
      />
      <div className={classes.action}>
        <Button
          disabled={loading}
          type="submit"
          color="primary"
          variant="contained"
          fullWidth
        >
          Próximo
        </Button>
      </div>
    </>
  );
};

export default UsernameStep;
