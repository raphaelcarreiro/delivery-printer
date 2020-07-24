import { Image } from '../../index';
import { UserActionTypes, SET_USER } from './types';

export type rules = 'admin-admin' | 'admin-operator'; // eslint-disable-line

export interface UserState {
  id?: number;
  image_id?: number;
  name: string;
  phone: string;
  email: string;
  image: Image;
  activated: boolean;
  rule: rules;
}

const INITIAL_STATE: UserState = {} as UserState;

export default function user(
  state = INITIAL_STATE,
  action: UserActionTypes
): UserState {
  switch (action.type) {
    case SET_USER: {
      return {
        ...action.user,
      };
    }
    default: {
      return state;
    }
  }
}
