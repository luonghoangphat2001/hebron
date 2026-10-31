export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;

export const EMAIL_LOCAL_PART_REGEX = /^[a-zA-Z0-9._%+-]+$/;

export const EMAIL_DOMAIN_PART_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const NUMERIC_ONLY_REGEX = /^\d+$/;

export const PHONE_NUMBER_REGEX = /^(01[016-9]|0[3-6][1-5]|070)-?\d{3,4}-?\d{4}$/;

// export const MAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// export const SLUG_REGEX = /^[\p{L}\p{N}]+(?:[_-][\p{L}\p{N}]+)*$/u;

// export const URL_REGEX = /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
