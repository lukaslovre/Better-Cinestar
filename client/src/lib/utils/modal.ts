/** Keep keyboard focus in an open modal and return it to the opener on close. */
export function modal(node: HTMLElement, close: () => void) {
  const opener =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const focusable = () =>
    Array.from(
      node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0);

  (focusable()[0] ?? node).focus();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const elements = focusable();
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first || !last) {
      event.preventDefault();
      node.focus();
    } else if (
      event.shiftKey &&
      (document.activeElement === first || !node.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || !node.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown);
  return {
    destroy() {
      document.removeEventListener('keydown', handleKeydown);
      if (opener?.isConnected) opener.focus();
    }
  };
}
