"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchOption {
  value: string;
  label: string;
}

interface SearchProps {
  options: SearchOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  emptySearchMessage?: string;
  searchPlaceholder?: string;
  groupHeading?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  disabled?: boolean;
}

export function Search({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select an option...",
  emptyMessage = "No results found",
  emptySearchMessage = "Start typing to search",
  searchPlaceholder = "Search...",
  groupHeading = "Results",
  className,
  triggerClassName,
  contentClassName,
  searchQuery: externalSearchQuery,
  onSearchQueryChange: externalOnSearchQueryChange,
  disabled = false,
}: SearchProps) {
  const [open, setOpen] = React.useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = React.useState("");

  // Use external search query if provided, otherwise use internal state
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const onSearchQueryChange =
    externalOnSearchQueryChange ?? setInternalSearchQuery;

  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", triggerClassName)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("dark w-96 p-0", contentClassName)}
        align="start"
      >
        <Command shouldFilter={false} className={className}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchQuery}
            onValueChange={onSearchQueryChange}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.trim().length === 0
                ? emptySearchMessage
                : emptyMessage}
            </CommandEmpty>
            {options.length > 0 && (
              <CommandGroup heading={groupHeading}>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange(
                        currentValue === selectedValue ? "" : currentValue,
                      );
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValue === option.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
