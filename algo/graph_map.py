import networkx as nx
import math

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