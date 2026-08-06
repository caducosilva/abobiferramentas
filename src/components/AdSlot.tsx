import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSlotProps {
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  className?: string;
}

const ADSENSE_CLIENT = 'ca-pub-7169685901436487';

/**
 * Always passive: never gates or blocks an action (download, copy, etc).
 * A past commit removed a forced ad-view interstitial specifically because
 * Google flags that pattern as a risk for AdSense account suspension.
 */
export function AdSlot({ format = 'auto', className = '' }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script may not be ready yet or is blocked; fail silently.
    }
  }, []);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-600 uppercase">
        Publicidade
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot="auto"
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
