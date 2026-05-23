import React, { useRef, useState, useEffect } from "react";
import { Trash2, RotateCcw, PenTool, Circle } from "lucide-react";
import { DrawingPath } from "../types";

interface DrawingCanvasProps {
  paths: DrawingPath[];
  onChange: (paths: DrawingPath[]) => void;
  width?: number;
  height?: number;
  guideType?: "circle" | "cube" | "pentagon" | "none";
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  paths,
  onChange,
  height = 360,
  guideType = "none"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#2D2A26");
  const [penWidth, setPenWidth] = useState(3);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number; y: number }[]>([]);

  // Adjust canvas resolution based on device pixel ratio and container width
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get actual bounding size of container
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 500;
    const h = height;

    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      redrawPaths(ctx, w, h);
    }
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [paths, guideType]);

  const redrawPaths = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);

    // Draw reference guides if appropriate
    if (guideType === "circle") {
      ctx.strokeStyle = "rgba(92, 110, 88, 0.05)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.35, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (guideType === "cube") {
      // Light prompt for cube
      ctx.strokeStyle = "rgba(92, 110, 88, 0.04)";
      ctx.lineWidth = 2;
      ctx.strokeRect(w / 2 - 60, h / 2 - 60, 80, 80);
      ctx.strokeRect(w / 2 - 30, h / 2 - 30, 80, 80);
      ctx.beginPath();
      ctx.moveTo(w / 2 - 60, h / 2 - 60); ctx.lineTo(w / 2 - 30, h / 2 - 30);
      ctx.moveTo(w / 2 + 20, h / 2 - 60); ctx.lineTo(w / 2 + 50, h / 2 - 30);
      ctx.moveTo(w / 2 - 60, h / 2 + 20); ctx.lineTo(w / 2 - 30, h / 2 + 50);
      ctx.moveTo(w / 2 + 20, h / 2 + 20); ctx.lineTo(w / 2 + 50, h / 2 + 50);
      ctx.stroke();
    }

    // Draw saved paths
    paths.forEach((p) => {
      if (p.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current active path
    if (currentPathPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.moveTo(currentPathPoints[0].x, currentPathPoints[0].y);
      for (let i = 1; i < currentPathPoints.length; i++) {
        ctx.lineTo(currentPathPoints[i].x, currentPathPoints[i].y);
      }
      ctx.stroke();
    }
  };

  // Helper to extract canvas coordinate from absolute event
  const getCoordinates = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Event handlers for mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    setIsDrawing(true);
    setCurrentPathPoints([coords]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e.clientX, e.clientY);
    if (!coords) return;
    setCurrentPathPoints((prev) => [...prev, coords]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPathPoints.length > 1) {
      const newPath: DrawingPath = {
        points: currentPathPoints,
        color: penColor,
        width: penWidth,
      };
      onChange([...paths, newPath]);
    }
    setCurrentPathPoints([]);
  };

  // Event handlers for touch screen (iPad / Mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const coords = getCoordinates(touch.clientX, touch.clientY);
    if (!coords) return;
    setIsDrawing(true);
    setCurrentPathPoints([coords]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const coords = getCoordinates(touch.clientX, touch.clientY);
    if (!coords) return;
    setCurrentPathPoints((prev) => [...prev, coords]);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMouseUp();
  };

  // Canvas operations
  const clearCanvas = () => {
    onChange([]);
    setCurrentPathPoints([]);
  };

  const undoLast = () => {
    if (paths.length > 0) {
      onChange(paths.slice(0, paths.length - 1));
    }
  };

  // Trigger refresh drawing when interactive status changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      redrawPaths(ctx, rect.width, height);
    }
  }, [currentPathPoints]);

  return (
    <div ref={containerRef} className="w-full flex flex-col bg-white rounded-xl border border-[#D9D5CB] shadow-sm overflow-hidden select-none">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F4F1EA] border-b border-[#E5E2D9]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#5C6E58] flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5" /> 觸控/滑鼠手寫版
          </span>
          <div className="h-4 w-[1px] bg-[#E5E2D9]" />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPenWidth(3)}
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border transition ${
                penWidth === 3
                  ? "bg-[#5C6E58] text-white border-[#5C6E58]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              title="細筆"
            >
              細
            </button>
            <button
              type="button"
              onClick={() => setPenWidth(6)}
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border transition ${
                penWidth === 6
                  ? "bg-[#5C6E58] text-white border-[#5C6E58]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              title="粗筆"
            >
              中
            </button>
            <button
              type="button"
              onClick={() => setPenWidth(10)}
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border transition ${
                penWidth === 10
                  ? "bg-[#5C6E58] text-white border-[#5C6E58]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              title="極粗"
            >
              粗
            </button>
          </div>
          <div className="h-4 w-[1px] bg-[#E5E2D9]" />
          <div className="flex gap-1.5 items-center">
            {["#2D2A26", "#2563EB", "#DC2626", "#16A34A"].map((c) => (
              <button
                key={c}
                type="button"
                className="w-4 h-4 rounded-full border border-white shadow-sm flex items-center justify-center relative hover:scale-110 active:scale-95 transition"
                style={{ backgroundColor: c }}
                onClick={() => setPenColor(c)}
              >
                {penColor === c && (
                  <span className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={undoLast}
            disabled={paths.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#5C6E58] border border-[#D9D5CB] bg-white rounded-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            <RotateCcw className="w-3 h-3" /> 退回
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={paths.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 border border-red-200 bg-red-50 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-100 transition"
          >
            <Trash2 className="w-3 h-3" /> 清理板面
          </button>
        </div>
      </div>

      {/* Actual Drawing Canvas Wrapper */}
      <div className="relative bg-white" style={{ height }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-0 cursor-crosshair touch-none"
        />
        {paths.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none p-4 text-center">
            <p className="text-sm font-medium text-[#8C887D]/70 bg-[#F9F8F6]/80 px-3 py-1.5 rounded-full border border-[#E5E2D9] pointer-events-none">
              請在此區手繪或操作畫布
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
