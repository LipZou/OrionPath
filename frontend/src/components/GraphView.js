import React, { useEffect } from "react";

const GraphView = ({
  nodes = [],
  edges = [],
  deliveries = [],
  start = [0, 0],
  pathResult = null,
  onNodeClick = () => {},
  onEdgeClick = () => {},
  cellSize = 50
}) => {
  const NODE_RADIUS = 10;

  const scale = (coord) => {
    const [x, y] = coord;
    return [x * cellSize + cellSize, y * cellSize + cellSize];
  };

  const isDelivery = (x, y) => deliveries.some(d => d[0] === x && d[1] === y);
  const isStart = (x, y) => start[0] === x && start[1] === y;

  const maxX = Math.max(...nodes.map(n => n[0]), 0);
  const maxY = Math.max(...nodes.map(n => n[1]), 0);
  const svgWidth = (maxX + 2) * cellSize;
  const svgHeight = (maxY + 2) * cellSize;

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

  return (
    <svg width={svgWidth} height={svgHeight} style={{ background: "#f9f9f9", border: "1px solid #ccc" }}>
      {/* 箭头标记 */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#999" />
        </marker>
        <marker id="arrow-blocked" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="black" />
        </marker>
      </defs>

      {/* 所有边（箭头表示方向） */}
      {edges.map((edge, idx) => {
        const [sx, sy] = scale(edge.from);
        const [ex, ey] = scale(edge.to);
        const dx = ex - sx;
        const dy = ey - sy;

        const [ox, oy] = getOffset(dx, dy, 6); // 用于偏移箭头

        const color = edge.blocked ? "black" : "#999";
        const dash = edge.blocked ? "5,5" : "";
        const marker = edge.blocked ? "url(#arrow-blocked)" : "url(#arrow)";

        return (
          <line
            key={`edge-${idx}`}
            x1={sx + ox}
            y1={sy + oy}
            x2={ex + ox}
            y2={ey + oy}
            stroke={color}
            strokeWidth={2}
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

          // 🧠 打印每一段路径段
          console.log(`🔥 路径段 ${idx}: (${point}) → (${pathResult.full_path[idx + 1]})`);

          return (
            <line
              key={`realpath-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="red"
              strokeWidth={3}
            />
          );
        })}

      {/* 所有节点 */}
      {nodes.map((node, idx) => {
        const [x, y] = scale(node);
        const [nx, ny] = node;

        let color = "#ddd";
        if (isStart(nx, ny)) color = "green";
        else if (isDelivery(nx, ny)) color = "orange";

        return (
          <g key={`node-${idx}`} onClick={() => onNodeClick(node)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={NODE_RADIUS} fill={color} stroke="black" />
            <text x={x} y={y - 15} fontSize={12} textAnchor="middle" fill="black">
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
            <text
              key={`time-${idx}`}
              x={x}
              y={y - 25}
              fontSize={10}
              textAnchor="middle"
              fill="blue"
            >
              {timeStr}
            </text>
          );
        })}
    </svg>
  );
};

export default GraphView;