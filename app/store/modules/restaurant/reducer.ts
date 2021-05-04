import { RestaurantActionTypes, SET_RESTAURANT, SET_IS_OPEN } from './types';

export interface RestaurantConfigs {
  print_by_product: boolean;
  print_only_shipment: boolean;
}

export interface PrinterSetting {
  font_size: number;
  production_template_copies: number;
  shipment_template_copies: number;
}
export interface Restaurant {
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
  configs: RestaurantConfigs;
  printer_setting: PrinterSetting;
}

const INITIAL_STATE: Restaurant | null = null;

export default function restaurant(
  state = INITIAL_STATE,
  action: RestaurantActionTypes
): Restaurant | null {
  switch (action.type) {
    case SET_RESTAURANT: {
      if (!action.restaurant) return null;

      return {
        ...action.restaurant,
      };
    }
    case SET_IS_OPEN: {
      if (!state) return null;

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
