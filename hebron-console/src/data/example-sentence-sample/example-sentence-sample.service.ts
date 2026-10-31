import type { ExampleSentenceSampleInput } from '@/schemas/example-sentence-sample/example-sentence-sample.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { orUndefined } from '@/utils/helper/string.helper';
import type {
  ExampleSentenceSampleCategoryListREQ,
  ExampleSentenceSampleListREQ,
  ExampleSentenceSampleUpsertREQ,
} from './example-sentence-sample.request';
import type { ExampleSentenceSampleRESP } from './example-sentence-sample.response';

export const SAMPLE_CATEGORY_PICKER_PAGE_SIZE = 10;

export const getExampleSentenceSampleListInitFilter = (searchParams: URLSearchParams): ExampleSentenceSampleListREQ => {
  const categoryId = searchParams.get('board_category_no');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    keyword: orUndefined(searchParams.get('keyword')),
    board_category_no: categoryId ? Number(categoryId) : undefined,
    is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
  };
};

export const getExampleSentenceSampleCategoryListInitFilter = (
  searchParams: URLSearchParams,
): ExampleSentenceSampleCategoryListREQ => ({
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
  keyword: orUndefined(searchParams.get('keyword')),
  is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
});

export const transformExampleSentenceSampleRESPToInput = (sample: ExampleSentenceSampleRESP): ExampleSentenceSampleInput => ({
  title: sample.title,
  category_id: sample.category.id,
  board_category_no: sample.board_category_no,
  content: sample.content,
  is_active: sample.is_active,
});

export const transformExampleSentenceSampleInputToUpsertREQ = (
  input: ExampleSentenceSampleInput,
): ExampleSentenceSampleUpsertREQ => ({
  ...input,
  attachments: [],
});
