import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { GuestCartItem } from '@/utils/helper/guest-cart.helper';
import { cartAPI } from './cart.api';
import type { CartCheckoutREQ, CartQuoteREQ } from './cart.request';
import type { CartCheckoutRESP, CartItemCreateRESP, CartItemUpdateRESP } from './cart.response';
import { mapCartDetailToGuestCartItems, mapGuestCartItemToCreateRequest } from './cart.service';

export const CART_QUERY_KEYS = {
  all: ['cart'] as const,
  detail: () => [...CART_QUERY_KEYS.all, 'detail'] as const,
  quote: (itemIds: number[]) => [...CART_QUERY_KEYS.all, 'quote', itemIds] as const,
};

export const fetchCartItems = async (): Promise<GuestCartItem[]> => {
  const response = await cartAPI.getDetail();
  return mapCartDetailToGuestCartItems(response.data);
};

export const useCartQuery = (options?: Omit<UseQueryOptions<GuestCartItem[], AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>) =>
  useQuery({
    queryKey: CART_QUERY_KEYS.detail(),
    queryFn: fetchCartItems,
    ...options,
  });

export const useCartQuoteQuery = (body?: CartQuoteREQ) =>
  useQuery({
    queryKey: CART_QUERY_KEYS.quote(body?.item_ids ?? []),
    queryFn: () => cartAPI.checkQuote(body as CartQuoteREQ),
    select: (response) => response.data,
    enabled: Boolean(body?.item_ids.length),
  });

export const useCreateCartItemMutation = (
  options?: UseMutationOptions<BaseRESP<CartItemCreateRESP>, AxiosError<ErrorRESP>, GuestCartItem>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (item) => cartAPI.create(mapGuestCartItemToCreateRequest(item)),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateCartItemMutation = (
  options?: UseMutationOptions<
    BaseRESP<CartItemUpdateRESP>,
    AxiosError<ErrorRESP>,
    { itemId: number | string; quantity: number }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ itemId, quantity }) => cartAPI.update(itemId, { quantity }),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
      options?.onSuccess?.(...args);
    },
  });
};

export const useDeleteCartItemMutation = (options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: cartAPI.deleteItem,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.detail() });
      options?.onSuccess?.(...args);
    },
  });
};

export const useCheckoutCartOrderMutation = (
  options?: UseMutationOptions<BaseRESP<CartCheckoutRESP>, AxiosError<ErrorRESP>, CartCheckoutREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: cartAPI.checkoutOrder,
  });
