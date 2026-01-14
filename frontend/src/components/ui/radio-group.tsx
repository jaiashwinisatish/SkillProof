// @ts-nocheck
import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface RadioGroupItemProps {
  value: string;
  id: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn("grid gap-2", className)} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange?.(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id, children, className, ...props }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <input
        type="radio"
        id={id}
        value={value}
        className="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
        {...props}
      />
      <label htmlFor={id} className="cursor-pointer">
        {children}
      </label>
    </div>
  )
}
