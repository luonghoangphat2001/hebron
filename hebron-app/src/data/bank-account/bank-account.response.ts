export type BankAccountRESP = {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
};

export type BankAccountDetailRESP = {
  bank_account: BankAccountRESP | null;
};
