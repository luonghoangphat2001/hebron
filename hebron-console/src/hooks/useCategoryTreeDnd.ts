import { appToast } from '@/components/toast/AppToast';
import { useCategoryMoveMutation } from '@/data/category/category.query';
import type { CategorynNode } from '@/data/category/category.response';
import {
  buildCategoryMovePlan,
  canNestCategory,
  canPlaceCategoryBeside,
  findCategoryById,
  type CategoryDropIntent,
  type CategoryFlatRow,
  type CategoryMovePlan,
} from '@/data/category/category.tree';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import { PointerSensor, pointerWithin, useSensor, useSensors, type DragMoveEvent, type DragStartEvent } from '@dnd-kit/core';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Only ever set for a drop that really would change something — it carries the very plan that will
 * be sent, so the preview and the request can never disagree.
 */
type DropTarget = {
  overId: number;
  position: 'before' | 'after' | 'inside';
  /** level the dragged node would land at, so the landing ghost can indent to it */
  depth: number;
  plan: CategoryMovePlan;
};

const ROW_GAP = 2; // matches space-y-0.5 on the list

/** breathing room opened on each side of the ghost, so the slot reads as a hole and not as one more row */
const DROP_SPACING = 10;

export const indentOf = (depth: number) => depth * 20 + 8;

type Params = {
  categories: CategorynNode[];
  rows: CategoryFlatRow[];
  /** caller-side reason to refuse dragging (an active filter shows only part of each sibling group) */
  disabled: boolean;
};

/**
 * All the drag geometry for the category tree. Nothing here ever adds or removes a row: the drop
 * feedback is transform-only, so the rects dnd-kit measured on drag start stay valid for the whole
 * gesture and the hit-testing cannot oscillate.
 */
export const useCategoryTreeDnd = ({ categories, rows, disabled }: Params) => {
  const { t: tCommon } = useTranslation('common');

  const [activeId, setActiveId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const rowStep = rowHeight + ROW_GAP;

  const listRef = useRef<HTMLDivElement>(null);
  const rowTops = useRef(new Map<number, number>());

  const moveMutation = useCategoryMoveMutation();
  const activeNode = activeId === null ? null : findCategoryById(categories, activeId);

  /** the slot the landing ghost falls back to when there is no valid drop */
  const activeRow = useMemo(() => {
    if (activeId === null) return null;
    const index = rows.findIndex((row) => row.node.id === activeId);
    return index < 0 ? null : { index, depth: rows[index].depth };
  }, [activeId, rows]);

  /**
   * Where the new slot opens, as a flat row index. The dragged row keeps its own slot — it stays put
   * as the "leaving from here" ghost — so this only ever pushes rows down, never closes a gap.
   */
  const hole = useMemo(() => {
    if (!dropTarget || dropTarget.position === 'inside') return null;
    const index = rows.findIndex((row) => row.node.id === dropTarget.overId);
    if (index < 0) return null;
    return { index: dropTarget.position === 'before' ? index : index + 1, depth: dropTarget.depth };
  }, [dropTarget, rows]);

  const ghost = useMemo(
    () =>
      activeNode && activeRow
        ? {
            name: activeNode.name,
            visible: hole !== null,
            top: (hole?.index ?? activeRow.index) * rowStep + (hole ? DROP_SPACING : 0),
            left: indentOf(hole?.depth ?? activeRow.depth),
            height: rowHeight,
          }
        : null,
    [activeNode, activeRow, hole, rowStep, rowHeight],
  );

  /**
   * FLIP: once a move is committed the rows are already in their new slots, so replay the jump as a
   * short glide from where each row used to be. Web Animations rather than inline styles, because
   * React owns the `transform` of these same elements while a drag is running.
   */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const previous = rowTops.current;
    const current = new Map<number, number>();

    for (const { node } of rows) {
      const el = list.querySelector<HTMLElement>(`[data-row='${node.id}']`);
      if (!el) continue;

      const top = el.offsetTop;
      current.set(node.id, top);

      const from = previous.get(node.id);
      if (activeId !== null || from === undefined || from === top) continue;

      el.animate([{ transform: `translateY(${from - top}px)` }, { transform: 'none' }], {
        duration: 220,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
      });
    }

    rowTops.current = current;
  }, [rows, activeId]);

  // the rows themselves stay `cursor-pointer` (clicking one selects it); only an actual drag grabs
  useEffect(() => {
    if (activeId === null) return;
    document.body.classList.add('is-dragging');
    return () => document.body.classList.remove('is-dragging');
  }, [activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
    setDropTarget(null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, delta, activatorEvent } = event;
    if (!over || !activeNode) return setDropTarget(null);

    const overRow = rows.find((row) => row.node.id === Number(over.id));
    if (!overRow || overRow.node.id === activeNode.id) return setDropTarget(null);

    // measured once at drag start and never invalidated, so the bands are a pure function of the pointer
    const { top, height } = over.rect;
    const pointerY = (activatorEvent as PointerEvent).clientY + delta.y;

    // rows are uniform, and this is the only rect that is reliably measured — active.rect is still
    // null in onDragStart, which would leave the landing ghost stuck at the top of the list
    if (height && height !== rowHeight) setRowHeight(height);

    // top/bottom band → drop between rows, middle band → drop inside
    const nestable = canNestCategory(activeNode, overRow.node, overRow.depth);
    const edge = nestable ? Math.max(6, Math.min(10, height * 0.3)) : height / 2;
    const position = pointerY < top + edge ? 'before' : pointerY > top + height - edge ? 'after' : 'inside';

    const allowed = position === 'inside' ? nestable : canPlaceCategoryBeside(activeNode, overRow.node, overRow.depth);
    if (!allowed) return setDropTarget(null);

    const intent: CategoryDropIntent =
      position === 'inside'
        ? { type: 'nest', parentId: overRow.node.id }
        : { type: 'reorder', overId: overRow.node.id, position };

    // a drop that would not move anything must not promise that it will — otherwise the landing
    // ghost shows up right next to the row it came from and reads like a broken preview
    const plan = buildCategoryMovePlan(categories, activeNode, intent);
    if (!plan) return setDropTarget(null);

    setDropTarget({
      overId: overRow.node.id,
      position,
      depth: position === 'inside' ? overRow.depth + 1 : overRow.depth,
      plan,
    });
  };

  const resetDrag = () => {
    setActiveId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    const dragged = activeNode;
    const target = dropTarget;
    resetDrag();
    if (!dragged || !target) return;

    moveMutation.mutate(
      { id: dragged.id, ...target.plan },
      {
        onSuccess: () => appToast.success(tCommon('notify.success_update')),
        onError: (error) => appToast.error(getErrorMessage(error, tCommon('notify.fail_update'))),
      },
    );
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  return {
    listRef,
    activeNode,
    ghost,
    // a second move while the first is still renumbering would race it
    isDragDisabled: disabled || moveMutation.isPending,
    offsetOf: (index: number) => (hole && index >= hole.index ? rowStep + DROP_SPACING * 2 : 0),
    isDragging: (id: number) => activeId === id,
    isNestTarget: (id: number) => dropTarget?.overId === id && dropTarget.position === 'inside',
    dndContextProps: {
      sensors,
      collisionDetection: pointerWithin,
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onDragCancel: resetDrag,
    },
  };
};
