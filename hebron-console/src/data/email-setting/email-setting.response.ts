export type EmailSettingRESP = {
  id: number;
  sender_email: string;
  sender_name: string;
  receiver_emails: string[];
  effective_sender_email?: string;
  effective_sender_name?: string;
  effective_receiver_emails?: string[];
  updated_at?: string;
};
