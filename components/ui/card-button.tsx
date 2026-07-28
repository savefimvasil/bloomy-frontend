type CardButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function CardButton({ className = "", type = "button", ...props }: CardButtonProps) {
  return (
    <button
      type={type}
      className={`w-full cursor-pointer text-left transition ${className}`}
      {...props}
    />
  );
}
