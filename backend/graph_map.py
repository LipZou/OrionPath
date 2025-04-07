import networkx as nx
import matplotlib.pyplot as plt
from typing import List, Tuple, Optional, Dict

class GraphMap:
    def __init__(self, width, height):
        """
        初始化地图，生成一个 width × height 的有向图，并连接所有八个方向的边。
        """
        self.width = width
        self.height = height
        self.graph = nx.DiGraph()
        self.blocked_edges = set()  # 记录被封锁的边
        self._build_graph()

    def _build_graph(self):
        """
        构建图结构，每个格子连接其八个方向上的相邻点，默认边权为1或1.41。
        """
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                      (-1, -1), (-1, 1), (1, -1), (1, 1)]
        for y in range(self.height):
            for x in range(self.width):
                self.graph.add_node((x, y))
                for dx, dy in directions:
                    nx_, ny_ = x + dx, y + dy
                    if self.in_bounds(nx_, ny_):
                        weight = 1.41 if dx != 0 and dy != 0 else 1
                        self.graph.add_edge((x, y), (nx_, ny_), weight=weight)

    def in_bounds(self, x, y):
        """
        判断坐标是否在地图范围内。
        """
        return 0 <= x < self.width and 0 <= y < self.height

    def set_block_edge(self, from_node, to_node):
        """
        封锁指定边（单向），从图中移除并记录为 blocked。
        """
        if self.graph.has_edge(from_node, to_node):
            self.graph.remove_edge(from_node, to_node)
            self.blocked_edges.add((from_node, to_node))

    def toggle_block_edge(self, from_node, to_node):
        """
        切换封路状态：封路 → 恢复，恢复后自动补上默认耗时。
        """
        if self.graph.has_edge(from_node, to_node):
            self.graph.remove_edge(from_node, to_node)
            self.blocked_edges.add((from_node, to_node))
            return {"status": "blocked"}
        else:
            dx = abs(from_node[0] - to_node[0])
            dy = abs(from_node[1] - to_node[1])
            if dx <= 1 and dy <= 1:
                weight = 1.41 if dx == 1 and dy == 1 else 1
                self.graph.add_edge(from_node, to_node, weight=weight)
                self.blocked_edges.discard((from_node, to_node))
                return {"status": "unblocked", "restored_weight": weight}
            return {"status": "invalid", "reason": "not adjacent"}

    def set_edge_weight(self, from_node, to_node, weight):
        """
        修改边的权重（耗时），仅当边存在时生效。
        """
        if self.graph.has_edge(from_node, to_node):
            self.graph[from_node][to_node]["weight"] = weight
            return {"status": "ok"}
        return {"status": "error", "reason": "edge does not exist"}

    def neighbors(self, node):
        """
        获取某个节点当前可达的邻居节点。
        """
        return list(self.graph.successors(node))

    def print_edges(self):
        """
        调试用：打印图中所有边及其耗时。
        """
        for u, v, data in self.graph.edges(data=True):
            print(f"{u} → {v}, time = {data['weight']:.3f}")

    def get_nodes(self):
        """
        返回所有节点坐标，供前端可视化使用。
        """
        return list(self.graph.nodes())

    def get_edges(self):
        """
        返回所有边的信息：起点、终点、耗时、是否被封路。
        """
        return [{
            "from": u,
            "to": v,
            "weight": self.graph[u][v]["weight"],
            "blocked": (u, v) in self.blocked_edges
        } for u, v in self.graph.edges()]

    def get_edge_info(self, from_node, to_node):
        """
        查询某条边是否存在、是否被封路、当前耗时是多少。
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
        返回两个点之间的所有单向边信息（可能有 a→b 和 b→a），供前端点击边后选择编辑方向。
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

    def visualize(self,
                  deliveries: List['Delivery'],
                  start: Tuple[int, int],
                  path_result: Optional[Dict] = None,
                  grid_size: Optional[Tuple[int, int]] = None):
        """
        可视化整张地图，包括所有边、障碍、送货点、时间窗、最短路径等。
        """
        pos = {node: node for node in self.graph.nodes()}
        if grid_size is None:
            grid_size = (self.width, self.height)

        plt.figure(figsize=(8, 8))
        nx.draw_networkx_edges(self.graph, pos, edge_color="lightgray", width=1)
        edge_labels = nx.get_edge_attributes(self.graph, "weight")
        nx.draw_networkx_edge_labels(self.graph, pos, edge_labels=edge_labels, font_size=7)

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

        for i, d in enumerate(deliveries):
            x, y = d.location
            label = f"{i + 1}\n[{d.format_minutes(d.earliest)}~{d.format_minutes(d.latest)}]"
            plt.scatter(x, y, c="orange", s=300, edgecolors="black", zorder=5)
            plt.text(x, y, label, fontsize=9, ha="center", va="center", color="black")

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