import { PaymentMethod } from './paymentMethod';

export interface BoardMovementPayment {
  id: string;
  value: number;
  board_movement_id: string;
  payment_method_id: string;
  created_at: string;
  payment_method: PaymentMethod;
  formattedValue: string;
  formattedCreatedAt: string;
}
