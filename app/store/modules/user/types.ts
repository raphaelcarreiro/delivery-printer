import { UserState } from './reducer';

export const SET_USER = '@user/SET_USER';

interface SetUserAction {
  type: typeof SET_USER;
  user: UserState;
}

export type UserActionTypes = SetUserAction;
