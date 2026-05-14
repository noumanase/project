import { useId, useState, useRef, useEffect } from "react";
import { Label } from "./label";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  id: string | number;
  name: string;
}

interface AppSearchableSelectProps {
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
  // data: SelectOption[];
  value?: string | number;
  onChange?: (option: SelectOption | null) => void;
}

function AppSearchableSelect({
  label = "Label",
  placeholder = "Select an option",
  className = "",
  required = false,
  name = "",
  //   data = [],
  value = undefined,
  onChange,
}: AppSearchableSelectProps) {
  const data = [
    { id: 1, name: "Option 1" },
    { id: 2, name: "Option 2" },
    { id: 3, name: "Option 3" },
  ];
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = data.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Set initial selected value
  useEffect(() => {
    if (value) {
      const option = data.find((opt) => opt.id === value);
      setSelectedOption(option || null);
    }
  }, [value, data]);

  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearchTerm("");
    onChange?.(option);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearchTerm("");
    onChange?.(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="group relative w-full max-w-xs">
      {label && (
        <Label
          htmlFor={id}
          className="bg-background text-foreground absolute top-0 left-2 z-10 block -translate-y-1/2 px-1 text-xs"
        >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          id={id}
          type="text"
          placeholder={selectedOption ? "" : placeholder}
          value={isOpen ? searchTerm : selectedOption?.name || ""}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={`w-full px-4 py-2 border border-input bg-background text-foreground placeholder-text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md ${
            className || ""
          }`}
          name={name}
          autoComplete="off"
        />

        {/* Dropdown Icon */}
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-muted-foreground pointer-events-none transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        {/* Clear button when selected */}
        {selectedOption && !isOpen && (
          <button
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors ${
                  selectedOption?.id === option.id
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
                type="button"
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { AppSearchableSelect };
