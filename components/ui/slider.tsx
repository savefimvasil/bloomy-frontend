type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function Slider({ className = "", ...props }: SliderProps) {
  return (
    <input
      type="range"
      {...props}
      className={`h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-forest disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
