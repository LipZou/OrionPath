import networkx as nx
import matplotlib.pyplot as plt
from typing import List, Tuple, Optional, Dict

class GraphMap:
    def __init__(self, width, height):
        """
        初始化地图图结构，创建 width x height 的有向图。
        每个节点代表一个坐标点，边代表路径，默认连接 8 个方向。
        """
        self.width = width
        self.height = height
        self.graph = nx.DiGraph()
        self.blocked_edges = set()  # 记录被封锁的边（用作前端标记）
        self._build_graph()

    def _build_graph(self):
        """
        构建初始图，每个点与周围 8 个方向相邻点相连（上下左右 + 对角线）。
        默认耗时为 5（直线）或 7（对角线）。
        """
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                      (-1, -1), (-1, 1), (1, -1), (1, 1)]
        for y in range(self.height):
            for x in range(self.width):
                self.graph.add_node((x, y))
                for dx, dy in directions:
                    nx_, ny_ = x + dx, y + dy
                    if self.in_bounds(nx_, ny_):
                        weight = 7 if dx != 0 and dy != 0 else 5
                        self.graph.add_edge((x, y), (nx_, ny_), weight=weight)

    def in_bounds(self, x, y):
        """判断节点坐标是否在地图范围内。"""
        return 0 <= x < self.width and 0 <= y < self.height

    def set_block_edge(self, from_node, to_node):
        """将某条边标记为封路（不可通行），并记录下来。"""
        if self.graph.has_edge(from_node, to_node):
            self.graph.remove_edge(from_node, to_node)
            self.blocked_edges.add((from_node, to_node))

    def toggle_block_edge(self, from_node, to_node):
        """
        切换封路状态，不再从图中移除边，而是设置 blocked 状态，并在路径计算时忽略该边。
        """
        if (from_node, to_node) in self.blocked_edges:
            # ✅ 已经封路 → 解封
            self.blocked_edges.remove((from_node, to_node))
            return {"status": "unblocked"}
        else:
            # ✅ 封路，但不删除边，仅标记为 blocked
            self.blocked_edges.add((from_node, to_node))
            return {"status": "blocked"}

    def set_edge_weight(self, from_node, to_node, weight):
        """设置某条边的耗时（仅在边存在的前提下）。"""
        if self.graph.has_edge(from_node, to_node):
            self.graph[from_node][to_node]["weight"] = weight
            self.blocked_edges.discard((from_node, to_node))
            return {"status": "ok"}
        return {"status": "error", "reason": "edge does not exist"}

    def neighbors(self, node):
        """获取某个节点当前所有可达的邻居节点（后继节点）。"""
        return list(self.graph.successors(node))

    def print_edges(self):
        """调试用：打印所有边及其耗时。"""
        for u, v, data in self.graph.edges(data=True):
            print(f"{u} → {v}, time = {data['weight']:.3f}")

    def get_nodes(self):
        """返回所有节点坐标（供前端使用）。"""
        return list(self.graph.nodes())

    def get_edges(self):
        """
        获取所有边的列表，包括起点、终点、耗时和是否封路。
        供前端展示路径网格使用。
        """
        return [{
            "from": u,
            "to": v,
            "weight": self.graph[u][v]["weight"],
            "blocked": (u, v) in self.blocked_edges
        } for u, v in self.graph.edges()]

    def get_edge_info(self, from_node, to_node):
        """
        查询单条边的状态：
        是否存在、是否被封路、当前耗时是多少。
        """
        if not self.graph.has_edge(from_node, to_node):
            return {"exists": False, "blocked": True, "weight": None}
        return {
            "exists": True,
            "blocked": (from_node, to_node) in self.blocked_edges,
            "weight": self.graph[from_node][to_node]["weight"]
        }

    def get_bidirectional_edge_info(self, a, b):
        """
        获取节点 a 和 b 之间的两个方向的边（a→b 和 b→a），
        用于前端点击边后选择编辑哪一个方向。
        """
        result = []
        if self.graph.has_edge(a, b):
            result.append({
                "from": a,
                "to": b,
                "blocked": (a, b) in self.blocked_edges,
                "weight": self.graph[a][b]["weight"],
                "direction": "a→b"
            })
        if self.graph.has_edge(b, a):
            result.append({
                "from": b,
                "to": a,
                "blocked": (b, a) in self.blocked_edges,
                "weight": self.graph[b][a]["weight"],
                "direction": "b→a"
            })
        return result

    def get_effective_graph(self) -> nx.DiGraph:
        """
        返回一个不包含被封路边的图副本，供路径规划等算法使用。
        原图仍保留所有边（用于可视化）。
        """
        g = self.graph.copy()
        g.remove_edges_from(self.blocked_edges)
        return g

    def visualize(self,
                  deliveries: List['Delivery'],
                  start: Tuple[int, int],
                  path_result: Optional[Dict] = None,
                  grid_size: Optional[Tuple[int, int]] = None):
        """
        使用 matplotlib 可视化地图结构：
        显示所有节点、路径、封路信息、送货点、到达时间和红色最短路径。
        """
        pos = {node: node for node in self.graph.nodes()}
        if grid_size is None:
            grid_size = (self.width, self.height)

        plt.figure(figsize=(8, 8))
        nx.draw_networkx_edges(self.graph, pos, edge_color="lightgray", width=1)
        edge_labels = nx.get_edge_attributes(self.graph, "weight")
        nx.draw_networkx_edge_labels(self.graph, pos, edge_labels=edge_labels, font_size=7)

        # 绘制虚线封路边
        for i, (u, v) in enumerate(self.blocked_edges):
            x0, y0 = u
            x1, y1 = v
            plt.plot([x0, x1], [y0, y1], color="black", linestyle="dashed", linewidth=2,
                     label="Blocked" if i == 0 else "")

        nx.draw_networkx_nodes(self.graph, pos, node_size=50, node_color="lightblue")
        plt.scatter(*start, c="green", s=300, label="Start", zorder=5)
        plt.text(start[0], start[1], "Start", fontsize=10, ha="center", va="center", color="white",
                 bbox=dict(facecolor='green', edgecolor='black', boxstyle='circle'))

        for i, d in enumerate(deliveries):
            x, y = d.location
            label = f"{i + 1}\n[{d.format_minutes(d.earliest)}~{d.format_minutes(d.latest)}]"
            plt.scatter(x, y, c="orange", s=300, edgecolors="black", zorder=5)
            plt.text(x, y, label, fontsize=9, ha="center", va="center", color="black")

        # 路径展示（红线）
        if path_result:
            sequence = path_result["sequence"]
            arrival_times = path_result["arrival_times"]
            full_path_nodes = [start] + [d.location for d in sequence]
            real_edges = []
            for i in range(len(full_path_nodes) - 1):
                src, dst = full_path_nodes[i], full_path_nodes[i + 1]
                try:
                    path = nx.dijkstra_path(self.graph, source=src, target=dst, weight="weight")
                    real_edges += list(zip(path, path[1:]))
                except nx.NetworkXNoPath:
                    continue
            nx.draw_networkx_edges(self.graph, pos, edgelist=real_edges, edge_color="red", width=2.5)

            for i, d in enumerate(sequence):
                x, y = d.location
                label = f"{d.format_minutes(arrival_times[i])}"
                plt.text(x, y + 0.3, label, fontsize=9, ha="center", va="bottom", color="blue")

            plt.title(f"Optimal Delivery Path (Total Time: {path_result['total_time']:.1f} mins)")
        else:
            plt.title("Delivery Map (No valid path found)")

        plt.legend()
        plt.gca().invert_yaxis()
        plt.grid(True)
        plt.xlim(-1, grid_size[0])
        plt.ylim(-1, grid_size[1])
        plt.axis("on")
        plt.show()