export interface PaymentMethod {
  id: number | string;
  method: string;
  kind: 'card' | 'money' | 'bank_check' | 'other' | 'card' | 'picpay' | 'pix';
  mode: 'offline' | 'online';
  activated: boolean;
}

export interface PaymentMethodConfigs {
  gateway: string;
  pix_gateway: string;
  pagarme_api_key: string;
  cielo_merchant_key: string;
  cielo_merchant_id: string;
  cielo_env: 'development' | 'production';
  pagseguro_api_token: string;
  rede_pv: string;
  rede_token: string;
  rede_env: 'development' | 'production';
  mercado_pago_public_key: string;
  mercado_pago_access_token: string;
}

export interface PicPayConfig {
  picpay_expiration_time: number;
  picpay_token: string;
  picpay_seller_token: string;
}
