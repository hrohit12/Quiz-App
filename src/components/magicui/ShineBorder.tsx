"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string | string[];
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
}

export function ShineBorder({
  children,
  className,
  color = "#2563eb",
  borderRadius = 12,
  borderWidth = 2,
  duration = 14,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${
            Array.isArray(color) ? color.join(",") : color
          },transparent,transparent)`,
        } as React.CSSProperties
      }
      className={cn(
        "relative min-h-[50px] w-fit min-w-[120px] place-items-center rounded-[--border-radius] bg-white p-[--border-width] dark:bg-black",
        className,
      )}
    >
      <div
        className={cn(
          "before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] motion-safe:before:animate-shine",
        )}
      ></div>
      <div className="relative z-10 h-full w-full rounded-[calc(var(--border-radius)-var(--border-width))] bg-white dark:bg-slate-950">
        {children}
      </div>
    </div>
  );
}
