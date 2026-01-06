import * as React from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";

type Props = React.ComponentProps<typeof Input>;

export const PasswordInput = React.forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={className}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-1 text-slate-500 hover:text-slate-700"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
