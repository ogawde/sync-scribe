"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  rows = 8,
  cols = 27,
  cellSize = 56,
  interactive = true,
  className,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
  interactive?: boolean;
  className?: string;
}) => {
  const [gridSize, setGridSize] = useState({ rows, cols });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateGridSize = () => {
      if (!ref.current) {
        return;
      }

      const { clientWidth, clientHeight } = ref.current;

      setGridSize({
        cols: Math.max(cols, Math.ceil(clientWidth / cellSize) + 2),
        rows: Math.max(rows, Math.ceil(clientHeight / cellSize) + 2),
      });
    };

    updateGridSize();

    window.addEventListener("resize", updateGridSize);

    return () => {
      window.removeEventListener("resize", updateGridSize);
    };
  }, [cellSize, cols, rows]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden",
        "[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]",
        "dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]",
        !interactive && "pointer-events-none",
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
          rows={gridSize.rows}
          cols={gridSize.cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          interactive={interactive} clickedCell={null}        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ["--delay"]?: string;
  ["--duration"]?: string;
};

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = "#3f3f46",
  fillColor = "rgba(14,165,233,0.3)",
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  return (
    <div className={cn("relative z-[3]", className)} style={gridStyle}>
      {cells.map((idx) => {
        return (
          <div
            key={idx}
            className={cn(
              "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
              !interactive && "pointer-events-none",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
            }}
          />
        );
      })}
    </div>
  );
};
