'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ChartCard = ({ title, children, delay = 0, className = '' }: ChartCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
         bg-[var(--dark-bg)] border border-[var(--border-color-secondary)] rounded-xl p-4
        shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.2)]
        transition-all duration-300
        opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]
        ${isVisible ? 'opacity-100' : ''}
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-lg font-semibold mb-5 text-[#f5f5f5] flex items-center gap-2">
        <span className="w-1 h-5 bg-[#32b8c6] rounded" />
        {title}
      </h3>
      {children}
    </div>
  );
};
