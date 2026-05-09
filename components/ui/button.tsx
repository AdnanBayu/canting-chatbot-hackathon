import * as React from "react"

// 1. Define what properties (props) the Button can accept
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
  
  // 2. Define basic styles for every button
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  // 3. Define styles based on the 'variant' choice
  const variantStyles = {
    primary: "bg-[#0D3B2E] text-white hover:bg-[#155a47] shadow-sm",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };

  // 4. Define styles based on the 'size' choice
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // 5. Combine everything together
  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
