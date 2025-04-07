import React from "react";

const GraphView = ({
  nodes = [],
  edges = [],
  deliveries = [],
  start = [0, 0],
  pathResult = null,  // ✅ 新增：接收路径结果
  onNodeClick = () => {},
  onEdgeClick = () => {},
  width = 600,
  height = 600
}) => {
  const NODE_RADIUS = 10;

  const scale = (coord) => {
    const [x, y] = coord;
    return [x * 50 + 50, y * 50 + 50];
  };

  const isDelivery = (x, y) => deliveries.some(d => d[0] === x && d[1] === y);
  const isStart = (x, y) => start[0] === x && start[1] === y;

  // ⛳️ 构造路径边（红色线段）
  const getRedEdges = () => {
    if (!pathResult) return [];

    const points = [start, ...pathResult.sequence];
    const fullEdges = [];

    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];
      fullEdges.push({ from, to });
    }
    return fullEdges;
  };

  const redEdges = getRedEdges();

  return (
    <svg width={width} height={height} style={{ background: "#f9f9f9", border: "1px solid #ccc" }}>
      {/* 所有边 */}
      {edges.map((edge, idx) => {
        const [x1, y1] = scale(edge.from);
        const [x2, y2] = scale(edge.to);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const color = edge.blocked ? "black" : "#999";

        return (
          <g key={`edge-${idx}`} onClick={() => onEdgeClick(edge)}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={edge.blocked ? 3 : 1.5}
              style={{ cursor: "pointer" }}
            />
            <text x={midX} y={midY - 5} fontSize={10} textAnchor="middle" fill="gray">
              {edge.weight}
            </text>
          </g>
        );
      })}

      {/* 红色路径线（最短路线） */}
      {redEdges.map((edge, idx) => {
        const [x1, y1] = scale(edge.from);
        const [x2, y2] = scale(edge.to);
        return (
          <line
            key={`red-path-${idx}`}
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

      {/* 到达时间标签（蓝色） */}
      {pathResult &&
        pathResult.sequence.map((point, idx) => {
          const [x, y] = scale(point);
          const arrival = pathResult.arrival_times[idx];
          const hours = Math.floor((480 + arrival) / 60); // base time = 8:00 = 480min
          const mins = (480 + arrival) % 60;
          const timeStr = `${hours.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}`;

          return (
            <text
              key={`time-${idx}`}
              x={x}
              y={y + 20}
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