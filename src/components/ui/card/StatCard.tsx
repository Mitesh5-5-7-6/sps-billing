// src/components/StatCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  BadgeIndianRupee,
  ReceiptIndianRupee,
  BadgeCheck,
  CircleAlert,
  Building2,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  subtitleCount?: number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: 'revenue' | 'average' | 'received' | 'pending' | 'product';
  delay?: number;
  isCurrency?: boolean;
}

const iconMap = {
  revenue: { Icon: BadgeIndianRupee, gradient: 'from-[rgba(50,184,198,0.2)] to-[rgba(50,184,198,0.1)]', color: '#32b8c6' },
  average: { Icon: ReceiptIndianRupee, gradient: 'from-[rgba(230,129,97,0.2)] to-[rgba(230,129,97,0.1)]', color: '#e68161' },
  received: { Icon: BadgeCheck, gradient: 'from-[rgba(107,33,168,0.2)] to-[rgba(107,33,168,0.1)]', color: '#9333ea' },
  pending: { Icon: CircleAlert, gradient: 'from-[rgba(195,124,19,0.2)] to-[rgba(195,124,19,0.1)]', color: '#C37C13' },
  product: { Icon: Building2, gradient: 'from-[rgba(50,184,198,0.2)] to-[rgba(50,184,198,0.1)]', color: '#32b8c6' },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  subtitleCount,
  change,
  changeType = 'positive',
  icon,
  delay = 0,
  isCurrency = false,
}: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValue = useCountAnimation(value, 1200, isVisible);
  const animatedCount = useCountAnimation(subtitleCount || 0, 1000, isVisible);

  const { Icon, gradient, color } = iconMap[icon];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        bg-[var(--dark-bg)] border border-[var(--border-color-secondary)] rounded-xl p-6 
        shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.2)]
        transition-all duration-300 hover:translate-y-[-4px] hover:scale-[1.02]
        hover:shadow-[0_8px_16px_-4px_rgba(50,184,198,0.3)]
        opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]
        ${isVisible ? 'opacity-100' : ''}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--orange-text)] uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center
                      transition-transform duration-200 hover:scale-110 hover:rotate-[2deg]`}
        >
          <Icon size={24} color={color} />
        </div>
      </div>

      <div
        className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#f5f5f5] to-[#32b8c6] 
                   bg-clip-text text-transparent"
      >
        {isCurrency ? formatCurrency(animatedValue) : animatedValue}
      </div>

      <div className="text-xs text-[rgba(245,245,245,0.7)] flex items-center gap-1 flex-wrap">
        {subtitleCount !== undefined ? (
          <>
            <span>{animatedCount}</span>
            <span>{subtitle?.replace(/\d+/, '')}</span>
          </>
        ) : (
          <span>{subtitle}</span>
        )}
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded font-semibold
                        ${changeType === 'positive'
                ? 'text-[#32b8c6] bg-[rgba(50,184,198,0.1)]'
                : 'text-[#ff5459] bg-[rgba(255,84,89,0.1)]'
              }`}
          >
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
};
