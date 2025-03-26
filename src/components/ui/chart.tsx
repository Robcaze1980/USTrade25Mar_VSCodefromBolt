"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={className}
      style={
        {
          "--color-desktop": config.desktop?.color,
          "--color-mobile": config.mobile?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.ComponentProps<typeof Tooltip> {
  content: React.ReactNode
  cursor?: boolean
}

export function ChartTooltip({
  content,
  cursor = true,
  children,
  ...props
}: ChartTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
  indicator?: "dot" | "line"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter = (label) => label,
  valueFormatter = (value) => value.toString(),
  indicator = "line",
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{labelFormatter(label!)}</div>
        </div>
        <div className="grid gap-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              {indicator === "dot" && (
                <div
                  className="h-1 w-1 rounded-full"
                  style={{ background: item.color }}
                />
              )}
              {indicator === "line" && (
                <div
                  className="h-3 w-0.5 rounded-full"
                  style={{ background: item.color }}
                />
              )}
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.name}:
                </span>
                <span className="text-sm font-medium">
                  {valueFormatter(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}