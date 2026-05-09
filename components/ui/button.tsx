import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger'; // Optional: choose a look
  size?: 'sm' | 'md' | 'lg';                 // Optional: choose a size
}

export function Button({
  children,
  className = "",
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {

  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variantStyles = {
    primary: "bg-[#0D3B2E] text-white hover:bg-[#155a47] shadow-sm",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
