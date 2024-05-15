import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

import { forwardRef } from 'react';

import cn from '../cn';

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  outline?: boolean;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'danger' | 'primary' | 'secondary' | 'warning';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className = '',
      icon,
      outline,
      size = 'md',
      variant = 'primary',
      ...rest
    },
    ref
  ) {
    // 设置粉色相关的样式
    const commonStyles = {
      'border border-pink-500': variant === 'primary',
      'border border-pink-400': variant === 'secondary',
      'border border-pink-600': variant === 'danger',
      'border border-pink-300 focus:ring-pink-200/50': variant === 'warning'
    };

    const nonOutlineStyles = {
      'bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700':
        !outline && variant === 'primary',
      'bg-pink-400 text-white hover:bg-pink-500 active:bg-pink-600':
        !outline && variant === 'secondary',
      'bg-pink-600 text-white hover:bg-pink-700 active:bg-pink-800':
        !outline && variant === 'danger',
      'bg-pink-300 text-white hover:bg-pink-400 active:bg-pink-500':
        !outline && variant === 'warning'
    };

    const outlineStyles = {
      'text-pink-500 hover:bg-pink-50 active:bg-pink-100':
        outline && variant === 'primary',
      'text-pink-400 hover:bg-pink-50 active:bg-pink-100':
        outline && variant === 'secondary',
      'text-pink-600 hover:bg-pink-50 active:bg-pink-100':
        outline && variant === 'danger',
      'text-pink-300 hover:bg-pink-50 active:bg-pink-100':
        outline && variant === 'warning'
    };

    const sizeStyles = {
      'px-3 py-0.5 text-sm': size === 'sm',
      'px-4 py-1': size === 'md',
      'px-5 py-1.5': size === 'lg'
    };

    return (
      <button
        className={cn(
          {
            ...commonStyles,
            ...nonOutlineStyles,
            ...outlineStyles,
            ...sizeStyles,
            'inline-flex items-center space-x-1.5': icon && children
          },
          'rounded-full font-bold shadow-sm outline-2 outline-offset-2 focus:outline disabled:opacity-50',
          className
        )}
        ref={ref}
        type={rest.type}
        {...rest}
      >
        {icon ? icon : null}
        <div>{children}</div>
      </button>
    );
  }
);
