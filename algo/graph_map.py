import networkx as nx
import math
import matplotlib.pyplot as plt
import networkx as nx
from typing import List, Tuple, Optional, Dict

class GraphMap:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.graph = nx.DiGraph()  # 使用有向图（支持更复杂的路况）
        self.blocked_edges = set() # 记录阻断边
        self._build_graph()

    def _build_graph(self):
        directions = [  # 八个方向（上下左右 + 四个对角线）
            (-1,  0), (1,  0),   # 左右
            (0, -1), (0,  1),   # 上下
            (-1, -1), (-1, 1),  # 左上、左下
            (1, -1),  (1, 1)    # 右上、右下
        ]

        for y in range(self.height):
            for x in range(self.width):
                self.graph.add_node((x, y))  # 添加节点

                for dx, dy in directions:
                    nx_, ny_ = x + dx, y + dy
                    if self.in_bounds(nx_, ny_):
                        # 对角线边设置为 √2，其余为 1
                        weight = 1.41 if dx != 0 and dy != 0 else 1
                        self.graph.add_edge((x, y), (nx_, ny_), weight=weight)

    def in_bounds(self, x, y):
        """判断坐标是否在地图内"""
        return 0 <= x < self.width and 0 <= y < self.height

    def set_block_edge(self, from_node, to_node):
        """设置某条边不可通行（如封路）"""
        if self.graph.has_edge(from_node, to_node):
            self.graph.remove_edge(from_node, to_node)
            self.blocked_edges.add((from_node, to_node)) # 记录被阻断的边

    def set_edge_weight(self, from_node, to_node, weight):
        """设置某条边的权重（耗时）"""
        if self.graph.has_edge(from_node, to_node):
            self.graph[from_node][to_node]["weight"] = weight

    def neighbors(self, node):
        """获取某点所有可达邻居节点"""
        return list(self.graph.successors(node))

    def print_edges(self):
        """调试用：打印所有边和权重"""
        for u, v, data in self.graph.edges(data=True):
            print(f"{u} → {v}, time = {data['weight']:.3f}")

    def visualize(self,
                  deliveries: List['Delivery'],  # 如果你不想处理循环引用可以改为 Any
                  start: Tuple[int, int],
                  path_result: Optional[Dict] = None,
                  grid_size: Optional[Tuple[int, int]] = None):
        pos = {node: node for node in self.graph.nodes()}
        if grid_size is None:
            grid_size = (self.width, self.height)

        plt.figure(figsize=(8, 8))
        nx.draw_networkx_edges(self.graph, pos, edge_color="lightgray", width=1)
        edge_labels = nx.get_edge_attributes(self.graph, "weight")
        nx.draw_networkx_edge_labels(self.graph, pos, edge_labels=edge_labels, font_size=7)

        # Blocked edges
        if hasattr(self, "blocked_edges"):
            for i, (u, v) in enumerate(self.blocked_edges):
                x0, y0 = u
                x1, y1 = v
                plt.plot([x0, x1], [y0, y1], color="black", linestyle="dashed", linewidth=2,
                         label="Blocked" if i == 0 else "")

        nx.draw_networkx_nodes(self.graph, pos, node_size=50, node_color="lightblue")
        plt.scatter(*start, c="green", s=300, label="Start", zorder=5)
        plt.text(start[0], start[1], "Start", fontsize=10, ha="center", va="center", color="white",
                 bbox=dict(facecolor='green', edgecolor='black', boxstyle='circle'))

        # Draw deliveries
        for i, d in enumerate(deliveries):
            x, y = d.location
            label = f"{i + 1}\n[{d.format_minutes(d.earliest)}~{d.format_minutes(d.latest)}]"
            plt.scatter(x, y, c="orange", s=300, edgecolors="black", zorder=5)
            plt.text(x, y, label, fontsize=9, ha="center", va="center", color="black")

        # Draw best path
        if path_result:
            sequence = path_result["sequence"]
            arrival_times = path_result["arrival_times"]
            full_path = [start] + [d.location for d in sequence]
            edges = list(zip(full_path, full_path[1:]))
            full_path_nodes = [start] + [d.location for d in sequence]
            real_edges = []

            for i in range(len(full_path_nodes) - 1):
                src, dst = full_path_nodes[i], full_path_nodes[i + 1]
                try:
                    path = nx.dijkstra_path(self.graph, source=src, target=dst, weight="weight")
                    real_edges += list(zip(path, path[1:]))  # 加入路径中所有真实边
                except nx.NetworkXNoPath:
                    continue  # 安全处理：跳过无路径的情况

            nx.draw_networkx_edges(self.graph, pos, edgelist=real_edges, edge_color="red", width=2.5)

            for i, d in enumerate(sequence):
                x, y = d.location
                label = f"{d.format_minutes(arrival_times[i])}"
                plt.text(x, y + 0.3, label, fontsize=9, ha="center", va="bottom", color="blue")

            total_time = path_result["total_time"]
            plt.title(f"Optimal Delivery Path (Total Time: {total_time:.1f} mins)")
        else:
            plt.title("Delivery Map (No valid path found)")

        plt.legend()
        plt.gca().invert_yaxis()
        plt.grid(True)
        plt.xlim(-1, grid_size[0])
        plt.ylim(-1, grid_size[1])
        plt.axis("on")
        plt.show()