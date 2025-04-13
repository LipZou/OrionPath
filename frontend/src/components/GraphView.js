import React, { useEffect, useState, useRef } from "react";

const GraphView = ({
  nodes = [],
  edges = [],
  deliveries = [],
  start = [0, 0],
  pathResult = null,
  deliveryOrder = [],
  onNodeClick = () => {},
  onEdgeClick = () => {},
  cellSize = 50
}) => {
  const NODE_RADIUS = 12;
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const scale = (coord) => {
    const [x, y] = coord;
    return [x * cellSize + cellSize, y * cellSize + cellSize];
  };

  const isDelivery = (x, y) => deliveries.some(d => d[0] === x && d[1] === y);
  const isStart = (x, y) => start[0] === x && start[1] === y;

  const maxX = Math.max(...nodes.map(n => n[0]), 0);
  const maxY = Math.max(...nodes.map(n => n[1]), 0);
  const contentWidth = (maxX + 2) * cellSize;
  const contentHeight = (maxY + 2) * cellSize;

  // 偏移箭头线段，防止正反向箭头重叠
  const getOffset = (dx, dy, offset = 5) => {
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [(-dy / len) * offset, (dx / len) * offset];
  };

  // ✅ 调试用：输出路径信息
  useEffect(() => {
    if (pathResult?.full_path) {
      console.log("🔴 当前路径结果 full_path:", pathResult.full_path);
    }
  }, [pathResult]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Calculate the viewBox for responsive scaling
  const viewBox = `0 0 ${contentWidth} ${contentHeight}`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ background: "white" }}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <path 
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} 
              fill="none" 
              stroke="#f0f0f0" 
              strokeWidth="1"
            />
          </pattern>
          
          {/* Gradient for start node */}
          <radialGradient id="startGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#52c41a" />
            <stop offset="100%" stopColor="#389e0d" />
          </radialGradient>
          
          {/* Gradient for delivery nodes */}
          <radialGradient id="deliveryGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#ffa940" />
            <stop offset="100%" stopColor="#fa8c16" />
          </radialGradient>
          
          {/* Gradient for regular nodes */}
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </radialGradient>
          
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>

          {/* Arrow markers */}
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#aaa" />
          </marker>
          <marker id="arrow-blocked" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#ff4d4f" />
          </marker>
          <marker id="arrow-path" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#ff4d4f" />
          </marker>
        </defs>

        {/* Background grid */}
        <rect width={contentWidth} height={contentHeight} fill="url(#grid)" />

        {/* 所有边（箭头表示方向） */}
        {edges.map((edge, idx) => {
          const [sx, sy] = scale(edge.from);
          const [ex, ey] = scale(edge.to);
          const dx = ex - sx;
          const dy = ey - sy;

          const [ox, oy] = getOffset(dx, dy, 6);

          const color = edge.blocked ? "#ff4d4f" : "#bbb";
          const dash = edge.blocked ? "5,5" : "";
          const marker = edge.blocked ? "url(#arrow-blocked)" : "url(#arrow)";
          const strokeWidth = edge.blocked ? 2 : 1.5;

          return (
            <line
              key={`edge-${idx}`}
              x1={sx + ox}
              y1={sy + oy}
              x2={ex + ox}
              y2={ey + oy}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={dash}
              markerEnd={marker}
              onClick={() => onEdgeClick(edge)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* 红色路径：full_path */}
        {pathResult?.full_path?.length > 1 &&
          pathResult.full_path.map((point, idx) => {
            if (idx === pathResult.full_path.length - 1) return null;

            const [x1, y1] = scale(point);
            const [x2, y2] = scale(pathResult.full_path[idx + 1]);

            return (
              <line
                key={`realpath-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ff4d4f"
                strokeWidth={3}
                markerEnd="url(#arrow-path)"
                strokeLinecap="round"
              />
            );
          })}

        {/* 所有节点 */}
        {nodes.map((node, idx) => {
          const [x, y] = scale(node);
          const [nx, ny] = node;

          let fillColor = "url(#nodeGradient)";
          let strokeColor = "#ccc";
          let textColor = "#666";
          
          if (isStart(nx, ny)) {
            fillColor = "url(#startGradient)";
            strokeColor = "#389e0d";
            textColor = "#389e0d";
          } else if (isDelivery(nx, ny)) {
            fillColor = "url(#deliveryGradient)";
            strokeColor = "#fa8c16";
            textColor = "#fa8c16";
          }

          return (
            <g key={`node-${idx}`} onClick={() => onNodeClick(node)} style={{ cursor: "pointer" }}>
              <circle 
                cx={x} 
                cy={y} 
                r={NODE_RADIUS} 
                fill={fillColor} 
                stroke={strokeColor} 
                strokeWidth={1.5}
                filter="url(#dropShadow)"
              />
              <text 
                x={x} 
                y={y - 18} 
                fontSize={11} 
                fontWeight="500"
                textAnchor="middle" 
                fill={textColor}
                filter="url(#dropShadow)"
              >
                ({nx}, {ny})
              </text>
            </g>
          );
        })}

        {/* 到达时间（蓝色） */}
        {pathResult &&
          [start, ...pathResult.sequence].map((point, idx) => {
            const [x, y] = scale(point);
            const arrival = idx === 0 ? 0 : pathResult.arrival_times?.[idx - 1];
            if (arrival == null || isNaN(arrival)) return null;

            const baseMinutes = 480;
            const total = baseMinutes + arrival;
            const hours = Math.floor(total / 60);
            const mins = total % 60;
            const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

            return (
              <g key={`time-${idx}`}>
                <rect
                  x={x - 24}
                  y={y - 38}
                  width={48}
                  height={20}
                  rx={4}
                  ry={4}
                  fill="#1890ff"
                  opacity={0.9}
                  filter="url(#dropShadow)"
                />
                <text
                  x={x}
                  y={y - 24}
                  fontSize={11}
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="white"
                >
                  {timeStr}
                </text>
              </g>
            );
          })}

        {/* delivery order */}
        {deliveryOrder && deliveryOrder.map(({ x, y, order }) => {
          const [scaledX, scaledY] = scale([x, y]);
          return (
            <g key={`label-${x}-${y}`}>
              <circle 
                cx={scaledX} 
                cy={scaledY} 
                r={NODE_RADIUS - 3} 
                fill="white" 
              />
              <text
                x={scaledX}
                y={scaledY + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#ff4d4f"
              >
                {order}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GraphView;