export type BankAccountRESP = {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  updated_at?: string;
};

export type BankAccountDataRESP = {
  bank_account: BankAccountRESP;
};
