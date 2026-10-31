import AppSelect from '@/components/select/AppSelect';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { GeneratedPlaqueText } from '@/data/ai/ai.api';
import { useCreateCartItemMutation } from '@/data/cart/cart.query';
import { readProductDesign } from '@/data/design/product-design.service';
import { getDesignContentIdFromSearchParams } from '@/data/products/product.service';
import type { ProductItemRESP } from '@/data/products/products.response';
import { CALL_BACK_URL } from '@/utils/constants/common.constant';
import { MY_ROUTE, ROUTE_NAME } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import { DEFAULT_CART_CONTENT } from '@/utils/helper/guest-cart.helper';
import { HandCoinsIcon, NotePencilIcon, ShoppingBagIcon, TextAUnderlineIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AIPhraseAssistantModal from './AIPhraseAssistantModal';
import ConfirmPurchaseModeModal from './ConfirmPurchaseModeModal';
import ProductOptionGroup from './ProductOptionGroup';
import WritingTextModal from './WritingTextModal';

type ProductRightProps = {
  product: ProductItemRESP;
  hidePurchaseActions?: boolean;
};

const PURCHASE_METHOD_CARD_CLASS =
  'group hover:border-blue-brand hover:bg-blue-brand-25 flex flex-1 flex-col items-center justify-center gap-4 rounded-md border border-neutral-500 p-4 transition-all';
const PURCHASE_METHOD_BUTTON_CLASS =
  'bg-neutral-100 text-blue-brand hover:bg-blue-brand group-hover:border-none group-hover:bg-blue-brand group-hover:text-white';
const PURCHASE_METHODS = [
  { id: 'self-design', icon: NotePencilIcon, description: '디자인에디터로 셀프디자인', label: '구매하기' },
  { id: 'design-request', icon: TextAUnderlineIcon, description: '문안작성 후 디자인의뢰', label: '구매하기' },
  { id: 'direct-purchase', icon: HandCoinsIcon, description: '바로결제 후 시안은 메일로 의뢰', label: '구매하기' },
] as const;

const getSelectedOptionsFromParams = (product: ProductItemRESP, optionsParam: string) => {
  const optionIds = optionsParam
    .split(',')
    .map((value) => Number(value.trim()))
    .filter(Number.isFinite);

  return Object.fromEntries(
    (product.option_groups ?? []).flatMap((group) => {
      const option = group.options.find((item) => optionIds.includes(item.id));
      return option ? [[group.id, option.id]] : [];
    }),
  ) as Record<number, number | undefined>;
};

const getQuantityFromParams = (product: ProductItemRESP, quantityParam: string) => {
  const minQuantity = Math.max(product.min_quantity || 1, 1);
  const configuredMaxQuantity = product.max_quantity > 0 ? product.max_quantity : Number.MAX_SAFE_INTEGER;
  const inventoryMaxQuantity = product.stock_inventory_enabled !== false ? product.stock_quantity : Number.MAX_SAFE_INTEGER;
  const maxQuantity = Math.min(inventoryMaxQuantity, configuredMaxQuantity);
  const quantity = Number(quantityParam);

  if (!Number.isInteger(quantity) || quantity < minQuantity || maxQuantity < minQuantity) return minQuantity;

  return Math.min(quantity, maxQuantity);
};

const ProductRight = ({ product, hidePurchaseActions = false }: ProductRightProps) => {
  const { t: tCommon } = useTranslation('common');
  const { isAdmin, isLoggedIn } = useAuth();
  const { mutateAsync: createCartItem } = useCreateCartItemMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const designId = searchParams.get('design')?.trim() || '';
  const designContentId = getDesignContentIdFromSearchParams(searchParams);
  const optionsParam = searchParams.get('options')?.trim() || '';
  const quantityParam = searchParams.get('quantity')?.trim() || '';
  const [openWritingTextModal, setOpenWritingTextModal] = useState(false);
  const [openAIModal, setOpenAIModal] = useState(false);
  const [appliedAIPhrase, setAppliedAIPhrase] = useState<GeneratedPlaqueText | null>(null);
  const [openConfirmPurchaseModeModal, setOpenConfirmPurchaseModeModal] = useState(false);
  const [pendingPurchaseAction, setPendingPurchaseAction] = useState<'cart' | 'checkout' | null>(null);
  const [processingAction, setProcessingAction] = useState<'cart' | 'checkout' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | undefined>>(() =>
    getSelectedOptionsFromParams(product, optionsParam),
  );
  const optionGroups = product.option_groups ?? [];
  const priceContent = product.price_content?.trim();
  const minQuantity = Math.max(product.min_quantity || 1, 1);
  const configuredMaxQuantity = product.max_quantity > 0 ? product.max_quantity : Number.MAX_SAFE_INTEGER;
  const inventoryMaxQuantity = product.stock_inventory_enabled !== false ? product.stock_quantity : Number.MAX_SAFE_INTEGER;
  const maxQuantity = Math.min(inventoryMaxQuantity, configuredMaxQuantity);
  const [quantity, setQuantity] = useState(() => getQuantityFromParams(product, quantityParam));

  useEffect(() => {
    // URL params are also changed by related-product navigation and browser history.

    setSelectedOptions(getSelectedOptionsFromParams(product, optionsParam));
  }, [optionsParam, product]);

  useEffect(() => {
    setQuantity(getQuantityFromParams(product, quantityParam));
  }, [product, quantityParam]);
  const selectedOptionItems = optionGroups.flatMap((group) => {
    const option = group.options.find((item) => item.id === selectedOptions[group.id]);
    return option
      ? [
          {
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            additionalPrice: option.additional_price,
          },
        ]
      : [];
  });
  const selectedOptionPrice = selectedOptionItems.reduce((sum, option) => sum + option.additionalPrice, 0);
  const displayedBasePrice = isAdmin ? (product.supply_price ?? 0) : (product.selling_price ?? 0);
  const unitPrice = displayedBasePrice + selectedOptionPrice;
  const totalPrice = unitPrice * quantity;
  const hasSelectedRequiredOptions = optionGroups.every((group) => !group.is_required || Boolean(selectedOptions[group.id]));
  const hasAvailableQuantity = maxQuantity >= minQuantity;

  const productInfoItems = [
    { label: tCommon('title.size'), value: product.specification?.size || '-' },
    { label: tCommon('title.material'), value: product.specification?.materials || '-' },
    { label: tCommon('title.case'), value: product.specification?.case || '-' },
    ...(product.stock_inventory_enabled !== false
      ? [{ label: tCommon('title.stock_quantity'), value: product.stock_quantity + '개' }]
      : []),
    {
      label: tCommon('title.shipping_information'),
      value: product.specification?.product_period || product.specification?.shipping_info || '-',
    },
  ];

  const getCheckoutSearchParams = () => {
    const checkoutSearchParams = new URLSearchParams();

    checkoutSearchParams.set('product', product.slug);
    if (selectedOptionItems.length) {
      checkoutSearchParams.set('options', selectedOptionItems.map((option) => option.optionId).join(','));
    }
    checkoutSearchParams.set('quantity', String(quantity));

    return checkoutSearchParams;
  };

  const toConfiguredCheckout = async () => {
    if (!designId && !designContentId) return;

    setProcessingAction('checkout');
    try {
      if (designContentId) {
        const checkoutSearchParams = getCheckoutSearchParams();
        checkoutSearchParams.set('designContentId', String(designContentId));
        navigate(`${MY_ROUTE.CHECKOUT}?${checkoutSearchParams.toString()}`);
        return;
      }

      const design = await readProductDesign(designId);
      if (!design) {
        toEditor();
        return;
      }

      const checkoutSearchParams = getCheckoutSearchParams();
      checkoutSearchParams.set('design', designId);
      navigate(`${MY_ROUTE.CHECKOUT}?${checkoutSearchParams.toString()}`);
    } catch (error) {
      console.error('[Product details] Cannot load product design:', error);
      toEditor();
    } finally {
      setProcessingAction(null);
    }
  };

  const toDirectCheckout = () => {
    if (!hasSelectedRequiredOptions) return;

    navigate(`${MY_ROUTE.CHECKOUT}?${getCheckoutSearchParams().toString()}`);
  };

  const handleConfiguredCheckout = () => {
    if (!designId && !designContentId) return;

    if (!isLoggedIn) {
      setPendingPurchaseAction('checkout');
      setOpenConfirmPurchaseModeModal(true);
      return;
    }

    void toConfiguredCheckout();
  };

  const addDirectProductToCart = async () => {
    setProcessingAction('cart');
    try {
      await createCartItem({
        id: `${product.id}-cart-${Date.now()}`,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name.ko || product.name.en || product.slug,
        sku: product.sku,
        price: unitPrice,
        quantity,
        previewFront: product.first_image || '',
        selectedOptions: selectedOptionItems,
        createdAt: new Date().toISOString(),
      });
      navigate(MY_ROUTE.CART);
    } catch (error) {
      console.error('[Product details] Cannot add product to cart:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  const addConfiguredProductToCart = async () => {
    if (!designId && !designContentId) return;

    setProcessingAction('cart');
    try {
      if (designContentId) {
        await createCartItem({
          id: `${product.id}-cart-design-content-${designContentId}`,
          designContentId,
          productId: product.id,
          productSlug: product.slug,
          productName: product.name.ko || product.name.en || product.slug,
          sku: product.sku,
          price: unitPrice,
          quantity,
          previewFront: product.first_image || '',
          content: { ...DEFAULT_CART_CONTENT },
          selectedOptions: selectedOptionItems,
          createdAt: new Date().toISOString(),
        });
      } else {
        const design = await readProductDesign(designId);
        if (!design) {
          toEditor();
          return;
        }

        await createCartItem({
          id: `${product.id}-cart-${designId}`,
          designId,
          productId: product.id,
          productSlug: product.slug,
          productName: product.name.ko || product.name.en || product.slug,
          sku: product.sku,
          price: unitPrice,
          quantity,
          previewFront: design.previewFront,
          previewBack: design.previewBack,
          content: { ...DEFAULT_CART_CONTENT },
          selectedOptions: selectedOptionItems,
          createdAt: design.updatedAt,
        });
      }

      navigate(MY_ROUTE.CART);
    } catch (error) {
      console.error('[Product details] Cannot add configured product to cart:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleAddToCart = () => {
    if (!hasSelectedRequiredOptions) return;

    if (designId || designContentId) {
      if (!isLoggedIn) {
        setPendingPurchaseAction('cart');
        setOpenConfirmPurchaseModeModal(true);
        return;
      }

      void addConfiguredProductToCart();
      return;
    }

    void addDirectProductToCart();
  };

  const goToLogin = () => {
    setOpenConfirmPurchaseModeModal(false);
    const callbackUrl = `${location.pathname}${location.search}${location.hash}`;
    navigate(MY_ROUTE.LOGIN, { state: { [CALL_BACK_URL]: callbackUrl } });
  };

  const continueAsGuest = () => {
    setOpenConfirmPurchaseModeModal(false);
    if (pendingPurchaseAction === 'cart') void addConfiguredProductToCart();
    else if (pendingPurchaseAction === 'checkout') void toConfiguredCheckout();
    setPendingPurchaseAction(null);
  };

  const handleOptionChange = (groupId: number, optionId?: number) => {
    const nextSelectedOptions = { ...selectedOptions, [groupId]: optionId };
    const optionIds = Object.values(nextSelectedOptions).filter((id): id is number => Number.isFinite(id));
    const nextSearchParams = new URLSearchParams(searchParams);

    if (optionIds.length) {
      nextSearchParams.set('options', optionIds.join(','));
    } else {
      nextSearchParams.delete('options');
    }
    nextSearchParams.set('quantity', String(quantity));

    setSelectedOptions(nextSelectedOptions);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleQuantityChange = (nextQuantity: number) => {
    const updatedQuantity = Math.min(maxQuantity, Math.max(minQuantity, nextQuantity));
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set('quantity', String(updatedQuantity));
    setQuantity(updatedQuantity);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleClearOptionGroup = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('options');
    nextSearchParams.set('quantity', String(minQuantity));
    setSelectedOptions({});
    setQuantity(minQuantity);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const clearDesignParam = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('design');
    setSearchParams(nextSearchParams, { replace: true });
  };

  const clearDesignContentParam = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('designContentId');
    setSearchParams(nextSearchParams, { replace: true });
  };

  const toEditor = () => {
    const designQuery = designId ? `&design=${encodeURIComponent(designId)}` : '';
    const optionQuery = selectedOptionItems.length
      ? `&options=${encodeURIComponent(selectedOptionItems.map((option) => option.optionId).join(','))}`
      : '';
    const quantityQuery = `&quantity=${encodeURIComponent(String(quantity))}`;
    navigate(
      `${ROUTE_NAME.CANVAS_EDITOR}?product=${encodeURIComponent(product.slug)}${designQuery}${optionQuery}${quantityQuery}`,
    );
  };

  const handleOpenAIModal = () => {
    //setOpenWritingTextModal(false);
    setOpenAIModal(true);
  };

  const handleApplyAIPhrase = (item: GeneratedPlaqueText) => {
    setAppliedAIPhrase({ ...item });
    setOpenWritingTextModal(true);
  };

  const handleWritingTextModalOpenChange = (open: boolean) => {
    setOpenWritingTextModal(open);
    if (!open) setAppliedAIPhrase(null);
  };

  const purchaseMethodCards = [
    {
      ...PURCHASE_METHODS[0],
      disabled: Boolean(designContentId),
      onAction: toEditor,
    },
    {
      ...PURCHASE_METHODS[1],
      disabled: Boolean(designId),
      onAction: () => setOpenWritingTextModal(true),
    },
    {
      ...PURCHASE_METHODS[2],
      disabled: false,
      onAction: toDirectCheckout,
    },
  ];
  const selectedPurchaseMethod = designId
    ? {
        description: PURCHASE_METHODS[0].description,
        editLabel: '디자인 수정',
        icon: NotePencilIcon,
        onClear: clearDesignParam,
        onEdit: toEditor,
      }
    : designContentId
      ? {
          description: PURCHASE_METHODS[1].description,
          editLabel: '문안 수정',
          icon: TextAUnderlineIcon,
          onClear: clearDesignContentParam,
          onEdit: () => setOpenWritingTextModal(true),
        }
      : undefined;

  return (
    <>
      <section className='flex-1 space-y-5 pb-32 md:pb-0'>
        <div>
          <h2 className='text-display-xs font-bold'>{product.name.ko}</h2>
          <p className='mt-1.5 text-sm text-neutral-500'>
            {/* <span>{product.sku}</span>
            <span className='mx-1.5 inline-flex w-5 items-center justify-center'>•</span> */}
            <span>{product.categories.map((cate) => cate.name.ko).join(', ')}</span>
          </p>
          {/* <div className='mt-3 flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <StarIcon className='text-yellow-golden size-6' weight='fill' />
              <p className='text-md text-neutral-500'>{product.average_rating || 0}</p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-neutral-400'>제작사례</p>
              <p className='text-md text-neutral-500'>{product.total_reviews || 0}건</p>
            </div>
          </div> */}
        </div>
        <div className='flex items-center gap-1'>
          {priceContent && !isAdmin ? (
            <p className='text-display-xs md:text-display-md text-blue-brand font-bold'>{priceContent}</p>
          ) : (
            <>
              <p className='text-display-xs md:text-display-md text-blue-brand font-bold'>{formatPrice(totalPrice)}</p>
              {/* {product.discount_percentage && (
                <Badge variant='red' size='md'>
                  {product.discount_percentage}%
                </Badge>
              )} */}
            </>
          )}
        </div>
        <div className='space-y-3'>
          {productInfoItems.map((item) => (
            <div className='flex items-center gap-8' key={item.label}>
              <p className='w-24.5 text-sm font-medium text-neutral-500'>{item.label}</p>
              <p className='text-md font-bold text-neutral-950'>{item.value}</p>
            </div>
          ))}
        </div>
        <div className='h-px bg-neutral-200'></div>
        <div className='space-y-4'>
          {optionGroups.map((group) => (
            <AppSelect<number>
              key={group.id}
              label={group.name}
              required={group.is_required}
              value={selectedOptions[group.id]}
              options={group.options.map((option) => ({
                value: option.id,
                label: `${option.name}${option.additional_price === 0 ? '' : ` (${option.additional_price > 0 ? '+' : ''}${formatPrice(option.additional_price)})`}`,
              }))}
              onChange={(value) => handleOptionChange(group.id, value)}
              placeholder={tCommon('placeholder.please_select_option')}
              containerClassName='md:gap-6'
              labelClassName='md:w-26'
              wrapOptionLabel
            />
          ))}
          {hasSelectedRequiredOptions && (
            <ProductOptionGroup
              productName={product.name.ko || product.name.en || product.slug}
              selectedOptions={selectedOptionItems}
              quantity={quantity}
              totalPrice={totalPrice}
              minQuantity={minQuantity}
              maxQuantity={maxQuantity}
              onQuantityChange={handleQuantityChange}
              onClear={handleClearOptionGroup}
            />
          )}
        </div>
        <div className='h-px bg-neutral-200'></div>
        {hidePurchaseActions ? (
          <Button
            type='button'
            variant='outline'
            size='lg'
            className='h-12 w-full'
            disabled={!hasSelectedRequiredOptions}
            onClick={toEditor}>
            <NotePencilIcon className='size-5' />
            디자인 에디터 열기
          </Button>
        ) : !priceContent ? (
          <div className='space-y-3'>
            {selectedPurchaseMethod ? (
              <section className='border-blue-brand bg-blue-brand-25 flex flex-col gap-3 rounded-md border p-2 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                  <selectedPurchaseMethod.icon className='size-7 shrink-0' weight='duotone' />
                  <div>
                    <p className='text-sm font-bold'>{selectedPurchaseMethod.description}</p>
                    <p className='text-blue-brand mt-1 text-xs font-medium'>제작 방식이 선택되었습니다.</p>
                  </div>
                </div>
                <div className='flex gap-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='xs'
                    className='flex-1 sm:flex-none'
                    disabled={!hasSelectedRequiredOptions || !hasAvailableQuantity || processingAction !== null}
                    onClick={selectedPurchaseMethod.onEdit}>
                    {selectedPurchaseMethod.editLabel}
                  </Button>
                  <Button
                    type='button'
                    size='xs'
                    className='hidden sm:flex sm:flex-none'
                    loading={processingAction === 'checkout'}
                    disabled={!hasSelectedRequiredOptions || !hasAvailableQuantity || processingAction !== null}
                    onClick={handleConfiguredCheckout}>
                    {tCommon('button.buy_now')}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label='Clear selected purchase method'
                    disabled={processingAction !== null}
                    onClick={selectedPurchaseMethod.onClear}>
                    <XIcon className='size-4' />
                  </Button>
                </div>
              </section>
            ) : null}
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
              {purchaseMethodCards.map(({ id, icon: Icon, description, label, disabled, onAction }) => (
                <section className={PURCHASE_METHOD_CARD_CLASS} key={id}>
                  <Icon className='size-10' weight='duotone' />
                  <p className='text-center text-sm font-bold'>{description}</p>
                  <Button
                    type='button'
                    variant='ghost'
                    className={`${PURCHASE_METHOD_BUTTON_CLASS}`}
                    disabled={!hasSelectedRequiredOptions || !hasAvailableQuantity || disabled || processingAction !== null}
                    onClick={onAction}>
                    {label}
                  </Button>
                </section>
              ))}
            </div>
            <Button
              type='button'
              variant='outline'
              size='lg'
              className='bg-blue-brand hover:bg-blue-brand-700 disabled:bg-blue-brand hidden h-12 w-full text-white md:flex'
              loading={processingAction === 'cart'}
              disabled={!hasSelectedRequiredOptions || !hasAvailableQuantity || processingAction !== null}
              onClick={() => void handleAddToCart()}>
              <ShoppingBagIcon className='size-5' />
              {tCommon('button.add_to_cart')}
            </Button>
          </div>
        ) : null}
      </section>
      {!priceContent && !hidePurchaseActions ? (
        <section className='fixed right-0 bottom-0 left-0 z-20 border-t border-neutral-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_16px_-4px_rgba(16,24,40,0.08),0_-4px_6px_-2px_rgba(16,24,40,0.03)] md:hidden'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <p className='text-sm text-neutral-500'>총계</p>
            <p className='text-display-xs text-blue-brand font-bold'>{formatPrice(totalPrice)}</p>
          </div>
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              size='lg'
              className='h-12 flex-1'
              loading={processingAction === 'cart'}
              disabled={!hasSelectedRequiredOptions || !hasAvailableQuantity || processingAction !== null}
              onClick={handleAddToCart}>
              <ShoppingBagIcon className='size-5' />
              {tCommon('button.add_to_cart')}
            </Button>
            <Button
              type='button'
              size='lg'
              className='h-12 flex-1'
              loading={processingAction === 'checkout'}
              disabled={!hasSelectedRequiredOptions || !hasAvailableQuantity || processingAction !== null}
              onClick={selectedPurchaseMethod ? handleConfiguredCheckout : toDirectCheckout}>
              {selectedPurchaseMethod ? tCommon('button.buy_now') : PURCHASE_METHODS[2].label}
            </Button>
          </div>
        </section>
      ) : null}

      <WritingTextModal
        open={openWritingTextModal}
        onOpenChange={handleWritingTextModalOpenChange}
        title={tCommon('button.write_content')}
        confirmText={tCommon('button.write_content')}
        designContentId={designContentId}
        handleOpenAIModal={handleOpenAIModal}
        appliedAIPhrase={appliedAIPhrase}
      />
      <AIPhraseAssistantModal
        open={openAIModal}
        onOpenChange={setOpenAIModal}
        title={tCommon('button.ai_phrase_assit')}
        confirmText={tCommon('button.generate_text_3_seconds')}
        onApplyToWritingForm={handleApplyAIPhrase}
      />
      <ConfirmPurchaseModeModal
        open={openConfirmPurchaseModeModal}
        onOpenChange={(open) => {
          setOpenConfirmPurchaseModeModal(open);
          if (!open) setPendingPurchaseAction(null);
        }}
        onLogin={goToLogin}
        onGuestCheckout={continueAsGuest}
      />
    </>
  );
};

export default ProductRight;
