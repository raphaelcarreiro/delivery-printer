import { UserState } from './reducer';
import { SET_USER, UserActionTypes } from './types';

export function setUser(user: UserState): UserActionTypes {
  return {
    type: SET_USER,
    user,
  };
}
