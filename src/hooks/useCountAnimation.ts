import { useEffect, useRef, useState } from 'react';

export const useCountAnimation = (
  end: number,
  duration: number = 1200,
  shouldAnimate: boolean = true
) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(end);
      return;
    }

    const startTime = performance.now();
    const startValue = countRef.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentCount = startValue + (end - startValue) * easeProgress;
      countRef.current = currentCount;
      setCount(Math.round(currentCount));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, shouldAnimate]);

  return count;
};
