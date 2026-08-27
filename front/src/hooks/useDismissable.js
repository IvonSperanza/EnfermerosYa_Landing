import { useEffect } from 'react';

export default function useDismissable(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const onMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open, onClose, ref]);
}
