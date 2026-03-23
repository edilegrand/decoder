import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { createPortal } from 'react-dom';
import { format, parseISO, isValid } from 'date-fns';

type DatePickerPortalProps = {
  value: string;
  onChange: (val: string) => void;
  anchorRef?: React.RefObject<HTMLElement>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DatePickerPortal: React.FC<DatePickerPortalProps> = ({ value, onChange, anchorRef, open, onOpenChange }) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      // Position below the anchor; adjust with scroll offsets
      const top = r.bottom + window.scrollY;
      const left = r.left + window.scrollX;
      setPosition({ top, left });
    }
  }, [open, anchorRef]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) && anchorRef?.current && !anchorRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, anchorRef, onOpenChange]);

  const daySelected = useMemo(() => {
    if (!value) return undefined;
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }, [value]);

  const handleDate = (d: Date | undefined) => {
    if (!d) return;
    onChange(format(d, 'yyyy-MM-dd'));
    onOpenChange(false);
  };

  const calendar = (
    <div ref={popupRef} style={{ position: 'fixed', top: position.top, left: position.left }} className="z-50">
      <DayPicker mode="single" selected={daySelected} onSelect={handleDate} />
    </div>
  );

  return (
    <>
      {open && createPortal(calendar, document.body)}
    </>
  );
};

export { DatePickerPortal };