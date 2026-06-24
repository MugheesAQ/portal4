import React from 'react';

export default function StatusBadge({ status }) {
  const colors = {
    pending: 'text-[#C62828]',
    in_review: 'text-[#F57C00]',
    resolved: 'text-[#2E7D32]',
    closed: 'text-gray-500'
  };
  
  const bgColors = {
    pending: 'bg-[#C62828]',
    in_review: 'bg-[#F57C00]',
    resolved: 'bg-[#2E7D32]',
    closed: 'bg-gray-500'
  };

  const label = status?.replace('_', ' ').toUpperCase();
  const textColor = colors[status] || colors.pending;
  const dotColor = bgColors[status] || bgColors.pending;

  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold ${textColor}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
      {label}
    </span>
  );
}
