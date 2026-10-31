import DOMPurify from 'dompurify';

export const BLOCK_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,td,th,li,caption,div.category,div.delivery_memo,div.delivery_box';

/** The canonical tree is inert and is never inserted into the live document. */
export function parseDescription(html: string) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

export function hasEverawardWrapper(html: string) {
  return !!parseDescription(html).querySelector('.view_design_wrap');
}

export function makePreview(canonical: HTMLElement) {
  const preview = canonical.cloneNode(true) as HTMLElement;
  const originals = new WeakMap<Node, Node>();
  const visible = new WeakSet<Node>();
  function map(a: Node, b: Node) {
    originals.set(b, a);
    a.childNodes.forEach((child, index) => map(child, b.childNodes[index]));
  }
  map(canonical, preview);
  DOMPurify.sanitize(preview, {
    IN_PLACE: true,
    FORBID_TAGS: ['style', 'iframe', 'video', 'audio', 'form', 'input', 'button', 'textarea', 'select', 'object', 'embed'],
    FORBID_ATTR: ['contenteditable', 'autofocus', 'srcdoc'],
  });
  // Inline CSS may load remote resources or move content over the editor toolbar.
  preview.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const allowed = [
      'color',
      'background-color',
      'font-size',
      'font-weight',
      'font-style',
      'text-decoration',
      'text-align',
      'width',
      'height',
      'max-width',
      'line-height',
      'margin',
      'padding',
    ];
    const originalStyle = element.style;
    const safe = document.createElement('span').style;
    allowed.forEach((property) => {
      const value = originalStyle.getPropertyValue(property);
      if (value && !/url\s*\(|expression|var\s*\(/i.test(value)) safe.setProperty(property, value);
    });
    element.setAttribute('style', safe.cssText);
  });
  function mark(node: Node) {
    const original = originals.get(node);
    if (original) visible.add(original);
    node.childNodes.forEach(mark);
  }
  mark(preview);
  return { preview, originals, visible };
}

export type PreviewModel = ReturnType<typeof makePreview>;

/** Reconcile only a selected leaf, retaining original attributes and invisible canonical nodes. */
export function syncLeaf(element: HTMLElement, model: PreviewModel) {
  function sync(node: Node): Node {
    let original = model.originals.get(node);
    if (!original) {
      if (node.nodeType === Node.TEXT_NODE) original = document.createTextNode(node.textContent ?? '');
      else {
        const source = node as HTMLElement;
        const tag = /^(B|I|U|STRONG|EM|SPAN|BR)$/.test(source.tagName) ? source.tagName : 'SPAN';
        const created = document.createElement(tag);
        if (tag === 'SPAN') {
          created.style.color = source.style.color;
          created.style.fontSize = source.style.fontSize;
        }
        original = created;
      }
      model.originals.set(node, original);
      model.visible.add(original);
    }
    if (node.nodeType === Node.TEXT_NODE) original.textContent = node.textContent;
    else {
      const children = Array.from(node.childNodes, sync);
      Array.from(original.childNodes).forEach((child) => {
        if (model.visible.has(child) && !children.includes(child)) original.removeChild(child);
      });
      // Keep hidden canonical nodes in place while ordering rendered children.
      let cursor = original.firstChild;
      children.forEach((child) => {
        while (cursor && !model.visible.has(cursor)) cursor = cursor.nextSibling;
        if (cursor === child) cursor = cursor.nextSibling;
        else original.insertBefore(child, cursor);
      });
    }
    return original;
  }
  sync(element);
}

export function editableLeaves(preview: HTMLElement) {
  return Array.from(preview.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)).filter(
    (element) => !element.querySelector(`${BLOCK_SELECTOR},img,table,ul,ol`),
  );
}
