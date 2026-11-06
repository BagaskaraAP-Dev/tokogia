import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Menghitung naik dari nilai sebelumnya ke target. Hormati prefers-reduced-motion. */
export function useCountUp(target: number, durasi = 650): number {
  const reduce = useReducedMotion();
  const [nilai, setNilai] = useState(0);
  const sebelumnya = useRef(0);

  useEffect(() => {
    const dari = sebelumnya.current;
    if (reduce || dari === target) {
      setNilai(target);
      sebelumnya.current = target;
      return;
    }
    const delta = target - dari;
    const mulai = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - mulai) / durasi);
      const eased = 1 - Math.pow(1 - t, 3);
      setNilai(Math.round(dari + delta * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        sebelumnya.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durasi, reduce]);

  return nilai;
}
