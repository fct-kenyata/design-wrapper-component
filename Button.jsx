import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';
import { Button as UIButton } from './components/ui/button';
import { cn } from './lib/utils';

/**
 * Button — public design-system API, now rendered on the shadcn/ui primitive.
 *
 * The legacy prop surface (variant / size / loading / icon / iconPosition /
 * fullWidth) is preserved so existing consumer call sites need no changes.
 * Styling comes entirely from the shipped design-system.css (token-driven),
 * not inline styles.
 */

// Legacy variant names → shadcn variants.
const VARIANT_MAP = {
  primary: 'default',
  secondary: 'outline',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  success: 'default',
  warning: 'default',
  dark: 'secondary',
};

// Legacy size names → shadcn sizes.
const SIZE_MAP = {
  xs: 'xs',
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  xl: 'lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className,
  style,
  ...rest
}) => {
  const uiVariant = VARIANT_MAP[variant] ?? 'default';
  const uiSize = SIZE_MAP[size] ?? 'default';
  const dataIcon = iconPosition === 'right' ? 'inline-end' : 'inline-start';

  const iconNode = loading ? (
    <Loader2 className="animate-spin" data-icon={dataIcon} />
  ) : icon ? (
    <span data-icon={dataIcon} className="flex shrink-0">
      {icon}
    </span>
  ) : null;

  return (
    <UIButton
      type={type}
      variant={uiVariant}
      size={uiSize}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(fullWidth && 'w-full', className)}
      style={style}
      {...rest}
    >
      {iconPosition === 'left' && iconNode}
      {children && <span>{children}</span>}
      {iconPosition === 'right' && iconNode}
    </UIButton>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'danger',
    'success',
    'warning',
    'outline',
    'ghost',
    'dark',
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Button;
