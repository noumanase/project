import { useId } from "react";
import { Input } from "./input";
import { Label } from "./label";

function AppInput({
  type = "text",
  label = "",
  placeholder = "",
  className = "",
  required = false,
  name = "",
}) {
  const id = useId();

  return (
    <div className="group relative w-full max-w-xs">
      <Label
        htmlFor={id}
        className="bg-background text-foreground absolute top-0 left-2 z-1 block -translate-y-1/2 px-1 text-xs"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className={className}
        name={name}
      />
    </div>
  );
}

export { AppInput };
