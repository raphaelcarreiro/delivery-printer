import { RestaurantActionTypes, SET_RESTAURANT, SET_IS_OPEN } from './types';

export interface RestaurantState {
  id: number;
  is_open: boolean;
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  keywords?: string;
  title?: string;
  url: string;
  cnpj: string;
  corporate_name: string;
  email: string;
  primary_color: string;
  secondary_color: string;
  facebook_link?: string;
  instagram_link?: string;
  twitter_link?: string;
  image_id: number;
  cover_id: number;
  working_hours: string;
}

const INITIAL_STATE: RestaurantState = {} as RestaurantState;

export default function restaurant(
  state = INITIAL_STATE,
  action: RestaurantActionTypes
): RestaurantState {
  switch (action.type) {
    case SET_RESTAURANT: {
      return {
        ...action.restaurant,
      };
    }
    case SET_IS_OPEN: {
      return {
        ...state,
        is_open: action.isOpen,
      };
    }
    default: {
      return state;
    }
  }
}
