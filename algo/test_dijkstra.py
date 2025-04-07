from graph_map import GraphMap
from dijkstra import compute_distance_matrix
import matplotlib.pyplot as plt
import networkx as nx

def test_visual_distance_matrix():
    width, height = 6, 6
    gmap = GraphMap(width, height)

    # 设置障碍边
    gmap.set_block_edge((2, 2), (3, 3))
    gmap.set_block_edge((1, 1), (1, 2))

    # 设置关键点
    key_points = [(0, 0), (3, 4), (5, 5)]

    # 跑 Dijkstra 多源计算关键点间距离
    matrix = compute_distance_matrix(gmap, key_points)

    # 打印矩阵
    print("关键点之间的最短路径时间矩阵：")
    for (src, dst), time in matrix.items():
        print(f"{src} → {dst} = {time}")

    # 图形可视化
    pos = {node: node for node in gmap.graph.nodes()}  # 坐标 = 节点位置

    plt.figure(figsize=(8, 8))

    # ✅ 绘制图结构
    edge_colors = "lightgray"
    edge_widths = 1
    nx.draw_networkx_edges(gmap.graph, pos, edge_color=edge_colors, width=edge_widths)

    # ✅ 绘制阻断边
    for u, v in gmap.blocked_edges:
        plt.plot(
            [u[0], v[0]],
            [u[1], v[1]],
            color="black",
            linestyle="dashed",
            linewidth=2,
        )

    # ✅ 绘制关键点（起点 + 目的地）
    for i, point in enumerate(key_points):
        plt.scatter(*point, s=400, c="orange", edgecolors="black")
        plt.text(point[0], point[1], f"P{i}", fontsize=12, ha="center", va="center", color="black")

    # ✅ 绘制图节点
    nx.draw_networkx_nodes(gmap.graph, pos, node_size=50, node_color="lightblue")

    # ✅ 绘制边权标签
    edge_labels = nx.get_edge_attributes(gmap.graph, "weight")
    nx.draw_networkx_edge_labels(gmap.graph, pos, edge_labels=edge_labels, font_size=8)

    plt.title("GraphMap with Blocked Edges, Key Points, and Edge Weights")
    plt.gca().invert_yaxis()
    plt.axis("on")
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    test_visual_distance_matrix()