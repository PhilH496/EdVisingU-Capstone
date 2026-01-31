import { useRef, useCallback } from 'react';

//drags chatbot for admin + student chatbot
export function useDraggable() {
  const elementRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = elementRef.current;
    if (!element) return;

    // Only drag box from header
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;

    e.preventDefault(); // Prevent text selection
    isDraggingRef.current = true;
    
    const rect = element.getBoundingClientRect();
    posRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !element) return;

      const newX = moveEvent.clientX - posRef.current.x;
      const newY = moveEvent.clientY - posRef.current.y;

      // Bounds checking to keep chatbot on screen
      const maxX = window.innerWidth - element.offsetWidth;
      const maxY = window.innerHeight - element.offsetHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      element.style.left = `${boundedX}px`;
      element.style.top = `${boundedY}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return { elementRef, onMouseDown };
}