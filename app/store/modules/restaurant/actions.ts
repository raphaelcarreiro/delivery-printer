import { Restaurant } from './reducer';
import { SET_RESTAURANT, RestaurantActionTypes } from './types';

export function setRestaurant(
  restaurant: Restaurant | null
): RestaurantActionTypes {
  return {
    type: SET_RESTAURANT,
    restaurant,
  };
}

export function setRestaurantIsOpen(isOpen: boolean): RestaurantActionTypes {
  return {
    type: '@restaurant/SET_IS_OPEN',
    isOpen,
  };
}
