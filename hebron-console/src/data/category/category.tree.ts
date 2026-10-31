import type { CategorySortOrder } from './category.request';
import type { CategorynNode, CategoryProductPages } from './category.response';

// Pure tree maths for the category tree + its drag & drop reordering, and for the product order
// inside a category. No runtime imports.

// large > medium > small — a category branch can never be deeper than this
export const CATEGORY_MAX_DEPTH = 3;

export const normalizeCategoryTree = (nodes: CategorynNode[] = []): CategorynNode[] =>
  nodes.map((node) => ({ ...node, children: normalizeCategoryTree(node.children) }));

export const findCategoryById = (nodes: CategorynNode[], id: number): CategorynNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findCategoryById(node.children ?? [], id);
    if (found) return found;
  }
  return null;
};

export type CategoryFlatRow = { node: CategorynNode; depth: number };

/** Depth-first list of the rows actually painted in the tree (collapsed branches are skipped). */
export const flattenVisibleCategories = (
  nodes: CategorynNode[],
  isExpanded: (id: number) => boolean,
  depth = 0,
): CategoryFlatRow[] =>
  nodes.flatMap((node) => [
    { node, depth },
    ...(isExpanded(node.id) ? flattenVisibleCategories(node.children ?? [], isExpanded, depth + 1) : []),
  ]);

export const getCategorySiblings = (tree: CategorynNode[], parentId: number | null): CategorynNode[] =>
  parentId === null ? tree : (findCategoryById(tree, parentId)?.children ?? []);

/** 1 for a leaf, 2 for a node with leaf children, ... */
export const getCategorySubtreeHeight = (node: CategorynNode): number =>
  1 + Math.max(0, ...(node.children ?? []).map((child) => getCategorySubtreeHeight(child)));

export const isCategoryDescendant = (ancestor: CategorynNode, id: number): boolean =>
  (ancestor.children ?? []).some((child) => child.id === id || isCategoryDescendant(child, id));

/** Can `dragged` be dropped *into* `target`, where `target` sits at `targetDepth` (root = 0)? */
export const canNestCategory = (dragged: CategorynNode, target: CategorynNode, targetDepth: number): boolean => {
  if (target.id === dragged.id) return false;
  if (target.id === dragged.parent_id) return false; // already there — use the edge drop to move it last
  if (isCategoryDescendant(dragged, target.id)) return false; // would detach the subtree from the tree
  return targetDepth + 1 + getCategorySubtreeHeight(dragged) <= CATEGORY_MAX_DEPTH;
};

/**
 * Can `dragged` be dropped *next to* `target`? Edge drops are not limited to one sibling group —
 * landing beside a category of another level adopts that level's parent, which is the only way to
 * pull a node back out to the root.
 */
export const canPlaceCategoryBeside = (dragged: CategorynNode, target: CategorynNode, targetDepth: number): boolean => {
  if (target.id === dragged.id) return false;
  if (isCategoryDescendant(dragged, target.id)) return false;
  return targetDepth + getCategorySubtreeHeight(dragged) <= CATEGORY_MAX_DEPTH;
};

/**
 * Renumber a whole sibling group 1..n. Sending the *complete* group in one request is what keeps
 * sort_order unique — the backend never has to guess or shift, every sibling gets an explicit value.
 */
export const toCategorySortOrderPayload = (siblings: CategorynNode[]): CategorySortOrder[] =>
  siblings.map((node, index) => ({ id: node.id, sort_order: index + 1 }));

export type CategoryDropIntent =
  | { type: 'reorder'; overId: number; position: 'before' | 'after' } // dropped on a row's top/bottom edge
  | { type: 'nest'; parentId: number }; // dropped in the middle of another category

export type CategoryMovePlan = {
  parentId: number | null;
  /** true → PUT /categories/{id} { parent_id } has to run before the sort-order batch */
  isReparent: boolean;
  categories: CategorySortOrder[];
};

/** Returns null when the drop is a no-op or the intent no longer matches the tree. */
export const buildCategoryMovePlan = (
  tree: CategorynNode[],
  dragged: CategorynNode,
  intent: CategoryDropIntent,
): CategoryMovePlan | null => {
  if (intent.type === 'reorder') {
    const target = findCategoryById(tree, intent.overId);
    if (!target || target.id === dragged.id) return null;

    // the drop takes the level of the row it lands beside — that is what lets a node reach the root
    const parentId = target.parent_id;
    const siblings = getCategorySiblings(tree, parentId);
    const rest = siblings.filter((node) => node.id !== dragged.id);
    const anchor = rest.findIndex((node) => node.id === intent.overId);
    if (anchor < 0) return null;

    rest.splice(intent.position === 'before' ? anchor : anchor + 1, 0, dragged);

    const isReparent = parentId !== dragged.parent_id;
    if (!isReparent && rest.every((node, i) => node.id === siblings[i]?.id)) return null; // dropped back where it started

    return { parentId, isReparent, categories: toCategorySortOrderPayload(rest) };
  }

  if (intent.parentId === dragged.parent_id) return null;

  // the moved node joins its new siblings at the end, and the whole group is renumbered with it
  const siblings = getCategorySiblings(tree, intent.parentId).filter((node) => node.id !== dragged.id);
  return { parentId: intent.parentId, isReparent: true, categories: toCategorySortOrderPayload([...siblings, dragged]) };
};

// ── Optimistic cache patch ────────────────────────────────────────────────────

const removeCategoryNode = (nodes: CategorynNode[], id: number): CategorynNode[] =>
  nodes.filter((node) => node.id !== id).map((node) => ({ ...node, children: removeCategoryNode(node.children ?? [], id) }));

const insertCategoryNode = (nodes: CategorynNode[], parentId: number | null, moved: CategorynNode): CategorynNode[] => {
  if (parentId === null) return [...nodes, moved];
  return nodes.map((node) =>
    node.id === parentId
      ? { ...node, children: [...(node.children ?? []), moved] }
      : { ...node, children: insertCategoryNode(node.children ?? [], parentId, moved) },
  );
};

/** Replays a move on the cached tree so the list updates on drop instead of after the refetch. */
export const applyCategoryMove = (tree: CategorynNode[], draggedId: number, plan: CategoryMovePlan): CategorynNode[] => {
  const dragged = findCategoryById(tree, draggedId);
  if (!dragged) return tree;
  if (plan.parentId !== null && !findCategoryById(tree, plan.parentId)) return tree; // would drop the node on the floor

  const order = new Map(plan.categories.map((entry) => [Number(entry.id), Number(entry.sort_order)]));
  const detached = removeCategoryNode(tree, draggedId);
  const inserted = insertCategoryNode(detached, plan.parentId, { ...dragged, parent_id: plan.parentId });

  // only the group the payload covers gets re-sorted; the group it left keeps its relative order
  const resort = (nodes: CategorynNode[]): CategorynNode[] => {
    const next = nodes.map((node) => ({
      ...node,
      sort_order: order.get(node.id) ?? node.sort_order,
      children: resort(node.children ?? []),
    }));
    return next.some((node) => order.has(node.id)) ? next.sort((a, b) => a.sort_order - b.sort_order) : next;
  };

  return resort(inserted);
};

/**
 * Page lengths and everything else stay as they were: when the refetch agrees, the cache
 * is deep-equal and structural sharing turns it into a no-op render — nothing flickers.
 */
export const moveCategoryProduct = (data: CategoryProductPages, productId: number, position: number): CategoryProductPages => {
  const flat = data.pages.flatMap((page) => page.data.products);
  const from = flat.findIndex((product) => product.id === productId);
  const to = flat.findIndex((product) => product.position === position);
  if (from < 0 || to < 0 || from === to) return data;

  const moved = [...flat];
  moved.splice(to, 0, ...moved.splice(from, 1));
  const renumbered = moved.map((product, i) => ({ ...product, position: flat[i].position }));

  let start = 0;
  return {
    ...data,
    pages: data.pages.map((page) => {
      const end = start + page.data.products.length;
      const products = renumbered.slice(start, end);
      start = end;
      return { ...page, data: { ...page.data, products } };
    }),
  };
};
