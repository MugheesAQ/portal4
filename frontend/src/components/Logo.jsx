import React from 'react';

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10L10 25V50C10 75 25 90 50 95C75 90 90 75 90 50V25L50 10Z" fill="#0A1628"/>
      <path d="M50 35C41.7157 35 35 41.7157 35 50C35 58.2843 41.7157 65 50 65C47.0143 65 44.5 62.4857 44.5 59.5C44.5 56.5143 47.0143 54 50 54C52.9857 54 55.5 56.5143 55.5 59.5C55.5 58.2843 52.9857 65 50 65C58.2843 65 65 58.2843 65 50C65 41.7157 58.2843 35 50 35Z" fill="#C9A84C"/>
    </svg>
  );
}
