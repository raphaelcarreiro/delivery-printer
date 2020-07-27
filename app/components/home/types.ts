export interface PrinterData {
  id: number;
  name: string;
  order: OrderData;
  printed?: boolean;
}

interface Additional {
  id: number;
  name: string;
}

interface Ingredient {
  id: number;
  name: string;
}

export interface ComplementCategory {
  id: number;
  name: string;
  complements: Complement[];
}

interface Complement {
  id: number;
  name: string;
  additional: ComplementAdditional[];
  ingredients: ComplementIngredient[];
}

type ComplementAdditional = Additional;
type ComplementIngredient = Ingredient;

interface Product {
  id: number;
  name: string;
  final_price: number;
  price: number;
  formattedFinalPrice: string;
  formattedPrice: string;
  printer: PrinterData;
  amount: number;
  annotation: string;
  additional: Additional[];
  ingredients: Ingredient[];
  complement_categories: ComplementCategory[];
}

interface Shipment {
  id: number;
  address: string;
  formattedScheduledAt: string | null;
  scheduled_at: string | null;
  shipment_method: string;
}

interface Customer {
  name: string;
}

export interface OrderData {
  id: number;
  formattedId: string;
  formattedTotal: string;
  formattedChange: string;
  formattedDate: string;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTax: string;
  dateDistance: string;
  total: number;
  change: number;
  subtotal: number;
  discount: number;
  tax: number;
  created_at: string;
  products: Product[];
  shipment: Shipment;
  customer: Customer;
  printed: boolean;
}
