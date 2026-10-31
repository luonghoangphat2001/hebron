import type { NoticeTypeKey } from '@/data/notices/notices.response';

export const NOTICE_TABLE_LABELS = {
  number: '번호',
  category: '구분',
  title: '제목',
  views: '조회수',
  createdAt: '작성일',
  empty: '등록된 공지사항이 없습니다.',
  pageTitle: '공지사항',
  searchAriaLabel: '공지사항 검색',
  backToList: '공지사항 목록',
  share: '공유',
  attachments: '첨부파일',
  loading: '불러오는 중...',
} as const;

export const NOTICE_TYPE_LABELS: Record<NoticeTypeKey, string> = {
  important: '중요',
  maintenance: '점검',
  general: '안내',
};

export const getNoticeTypeLabel = (type: string) => NOTICE_TYPE_LABELS[type as NoticeTypeKey] ?? type;

export const formatNoticeDetailTitle = (type: string, title: string) => `[${getNoticeTypeLabel(type)}] ${title}`;
