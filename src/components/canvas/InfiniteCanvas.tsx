import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FrameCard } from "./FrameCard";
import { cn } from "@/lib/utils";

interface RemoteSelection {
  userId: string;
  userName: string;
  color: string;
}

interface Frame {
  id: string;
  position: { x: number; y: number };
  thumbnail?: string;
  isPolished?: boolean;
  isPolishing?: boolean;
  title?: string;
  thumbnailColor?: string;
  durationMs?: number;
  motionNotes?: string;
  isRemoteMoving?: boolean;
  remoteSelection?: RemoteSelection | null;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

interface InfiniteCanvasProps {
  frames: Frame[];
  connections: Connection[];
  selectedFrames: string[];
  onFrameSelect: (id: string, multiSelect?: boolean) => void;
  onFrameDelete: (id: string) => void;
  onFrameDuplicate: (id: string) => void;
  onCanvasClick: (position: { x: number; y: number }) => void;
  onFrameDoubleClick?: (id: string) => void;
  onConnectionDelete?: (id: string) => void;
  onFramePositionChange: (id: string, delta: { dx: number; dy: number }) => void;
  onFramePositionCommit?: (id: string) => void;
  onFramePolish?: (id: string) => void;
  activeTool: string;
  zoom: number;
  connectingFromFrameId?: string | null;
  beatModeEnabled?: boolean;
  onFrameDurationChange?: (id: string, durationMs: number) => void;
}

const FRAME_WIDTH = 192;
const FRAME_HEIGHT = 144;

function getSmartConnectionPath(from: Frame, to: Frame) {
  const fromCenter = {
    x: from.position.x + FRAME_WIDTH / 2,
    y: from.position.y + FRAME_HEIGHT / 2,
  };
  const toCenter = {
    x: to.position.x + FRAME_WIDTH / 2,
    y: to.position.y + FRAME_HEIGHT / 2,
  };

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  let fromPoint: { x: number; y: number };
  let toPoint: { x: number; y: number };

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      fromPoint = { x: from.position.x + FRAME_WIDTH, y: fromCenter.y };
      toPoint = { x: to.position.x, y: toCenter.y };
    } else {
      fromPoint = { x: from.position.x, y: fromCenter.y };
      toPoint = { x: to.position.x + FRAME_WIDTH, y: toCenter.y };
    }
  } else if (dy > 0) {
    fromPoint = { x: fromCenter.x, y: from.position.y + FRAME_HEIGHT };
    toPoint = { x: toCenter.x, y: to.position.y };
  } else {
    fromPoint = { x: fromCenter.x, y: from.position.y };
    toPoint = { x: toCenter.x, y: to.position.y + FRAME_HEIGHT };
  }

  const distance = Math.sqrt(dx * dx + dy * dy);
  const controlOffset = Math.max(distance * 0.35, 50);

  const cp1 =
    Math.abs(dx) > Math.abs(dy)
      ? { x: fromPoint.x + (dx > 0 ? controlOffset : -controlOffset), y: fromPoint.y }
      : { x: fromPoint.x, y: fromPoint.y + (dy > 0 ? controlOffset : -controlOffset) };

  const cp2 =
    Math.abs(dx) > Math.abs(dy)
      ? { x: toPoint.x + (dx > 0 ? -controlOffset : controlOffset), y: toPoint.y }
      : { x: toPoint.x, y: toPoint.y + (dy > 0 ? -controlOffset : controlOffset) };

  return {
    path: `M ${fromPoint.x} ${fromPoint.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${toPoint.x} ${toPoint.y}`,
    midpoint: {
      x: (fromPoint.x + toPoint.x) / 2,
      y: (fromPoint.y + toPoint.y) / 2,
    },
  };
}

function calculateSequenceNumbers(connections: Connection[]) {
  const sequenceMap = new Map<string, number>();
  if (connections.length === 0) return sequenceMap;

  const targetIds = new Set(connections.map((connection) => connection.to));
  const outgoingByFrom = new Map<string, Connection[]>();

  connections.forEach((connection) => {
    const existing = outgoingByFrom.get(connection.from);
    if (existing) {
      existing.push(connection);
    } else {
      outgoingByFrom.set(connection.from, [connection]);
    }
  });

  const visited = new Set<string>();
  let sequence = 1;

  const processChain = (startFromId: string) => {
    let currentFromId: string | undefined = startFromId;

    while (currentFromId) {
      const nextConnection = (outgoingByFrom.get(currentFromId) || []).find(
        (connection) => !visited.has(connection.id)
      );
      if (!nextConnection) break;

      sequenceMap.set(nextConnection.id, sequence);
      visited.add(nextConnection.id);
      sequence += 1;
      currentFromId = nextConnection.to;
    }
  };

  connections.forEach((connection) => {
    if (!targetIds.has(connection.from) && !visited.has(connection.id)) {
      processChain(connection.from);
    }
  });

  connections.forEach((connection) => {
    if (!visited.has(connection.id)) {
      sequenceMap.set(connection.id, sequence);
      visited.add(connection.id);
      sequence += 1;
    }
  });

  return sequenceMap;
}

export function InfiniteCanvas({
  frames,
  connections,
  selectedFrames,
  onFrameSelect,
  onFrameDelete,
  onFrameDuplicate,
  onCanvasClick,
  onFrameDoubleClick,
  onConnectionDelete,
  onFramePositionChange,
  onFramePositionCommit,
  onFramePolish,
  activeTool,
  zoom,
  connectingFromFrameId,
  beatModeEnabled = false,
  onFrameDurationChange,
}: InfiniteCanvasProps) {
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const frameById = useMemo(() => {
    const map = new Map<string, Frame>();
    frames.forEach((frame) => map.set(frame.id, frame));
    return map;
  }, [frames]);

  const selectedFrameSet = useMemo(() => new Set(selectedFrames), [selectedFrames]);

  const sequenceMap = useMemo(() => calculateSequenceNumbers(connections), [connections]);

  const connectionRenderData = useMemo(() => {
    return connections.flatMap((connection) => {
      const fromFrame = frameById.get(connection.from);
      const toFrame = frameById.get(connection.to);

      if (!fromFrame || !toFrame) {
        return [];
      }

      const { path, midpoint } = getSmartConnectionPath(fromFrame, toFrame);

      return [
        {
          id: connection.id,
          path,
          midpoint,
          sequenceNumber: sequenceMap.get(connection.id) || 1,
        },
      ];
    });
  }, [connections, frameById, sequenceMap]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === "pan" || e.button === 1) {
        setIsPanning(true);
        setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [activeTool, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
      }
    },
    [isPanning, startPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current && activeTool === "select") {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        onCanvasClick({ x, y });
      }
    },
    [activeTool, onCanvasClick, pan, zoom]
  );

  return (
    <div
      ref={canvasRef}
      className={cn(
        "absolute inset-0 overflow-hidden canvas-grid",
        isPanning ? "cursor-grabbing" : activeTool === "pan" ? "cursor-grab" : "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <motion.div
        className="absolute"
        style={{
          x: pan.x,
          y: pan.y,
          scale: zoom,
          transformOrigin: "0 0",
        }}
      >
        <svg className="absolute inset-0 w-[5000px] h-[5000px]" style={{ pointerEvents: "none" }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M 0 0 L 10 4 L 0 8 L 2 4 Z" fill="rgba(255, 255, 255, 0.8)" />
            </marker>
            <marker id="arrowheadHover" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
              <path d="M 0 0 L 12 5 L 0 10 L 2.5 5 Z" fill="rgba(255, 255, 255, 1)" />
            </marker>
            <filter id="connectionGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {connectionRenderData.map((connection) => {
            const isHovered = hoveredConnection === connection.id;
            const labelX = connection.midpoint.x;
            const labelY = connection.midpoint.y - 18;

            return (
              <g key={connection.id}>
                <path
                  d={connection.path}
                  stroke="transparent"
                  strokeWidth="24"
                  fill="none"
                  style={{ pointerEvents: "stroke", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredConnection(connection.id)}
                  onMouseLeave={() => setHoveredConnection(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnectionDelete?.(connection.id);
                  }}
                />

                <path
                  d={connection.path}
                  stroke={isHovered ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={isHovered ? 6 : 4}
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#connectionGlow)"
                  style={{ pointerEvents: "none" }}
                />

                <path
                  d={connection.path}
                  stroke={isHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.7)"}
                  strokeWidth={isHovered ? 3 : 2.5}
                  strokeDasharray={isHovered ? "12 6" : "8 6"}
                  fill="none"
                  markerEnd={isHovered ? "url(#arrowheadHover)" : "url(#arrowhead)"}
                  strokeLinecap="round"
                  style={{
                    pointerEvents: "none",
                    transition: "stroke 0.15s ease, stroke-width 0.15s ease",
                  }}
                />

                <g
                  transform={`translate(${labelX}, ${labelY})`}
                  style={{ pointerEvents: "auto", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredConnection(connection.id)}
                  onMouseLeave={() => setHoveredConnection(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnectionDelete?.(connection.id);
                  }}
                >
                  <circle
                    r={12}
                    fill={isHovered ? "rgba(255, 255, 255, 0.95)" : "rgba(30, 30, 40, 0.9)"}
                    stroke={isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.6)"}
                    strokeWidth={2}
                    style={{ transition: "fill 0.15s ease, stroke 0.15s ease" }}
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isHovered ? "#1a1a2e" : "white"}
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {connection.sequenceNumber}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {frames.map((frame, index) => (
          <FrameCard
            key={frame.id}
            id={frame.id}
            index={index}
            title={frame.title}
            thumbnail={frame.thumbnail}
            thumbnailColor={frame.thumbnailColor}
            isSelected={selectedFrameSet.has(frame.id)}
            isConnecting={connectingFromFrameId === frame.id}
            isPolished={frame.isPolished}
            isPolishing={frame.isPolishing}
            onClick={() => onFrameSelect(frame.id)}
            onDoubleClick={() => onFrameDoubleClick?.(frame.id)}
            onDelete={() => onFrameDelete(frame.id)}
            onDuplicate={() => onFrameDuplicate(frame.id)}
            onPolish={() => onFramePolish?.(frame.id)}
            position={frame.position}
            zoom={zoom}
            onPositionChange={(delta) => onFramePositionChange(frame.id, delta)}
            onPositionCommit={() => onFramePositionCommit?.(frame.id)}
            beatModeEnabled={beatModeEnabled}
            durationMs={frame.durationMs}
            onDurationChange={(newDuration) => onFrameDurationChange?.(frame.id, newDuration)}
            motionNotes={frame.motionNotes}
            isRemoteMoving={frame.isRemoteMoving}
            remoteSelection={frame.remoteSelection}
          />
        ))}
      </motion.div>
    </div>
  );
}
