import { RestaurantState } from './reducer';

export const SET_RESTAURANT = '@restaurant/SET_RESTAURANT';
export const SET_IS_OPEN = '@restaurant/SET_IS_OPEN';

export interface SetRestaurantAction {
  type: typeof SET_RESTAURANT;
  restaurant: RestaurantState;
}

export interface SetRestaurantIsOpen {
  type: typeof SET_IS_OPEN;
  isOpen: boolean;
}

export type RestaurantActionTypes = SetRestaurantAction | SetRestaurantIsOpen;
