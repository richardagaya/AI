"use client";

import { forwardRef } from "react";
import {
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "solar", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  },
);
