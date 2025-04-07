from graph_map import GraphMap
import networkx as nx
import matplotlib.pyplot as plt


'''
test case: run python backend/test_graphMap.py in pycharm terminal
'''
def test_graph_visual():
    width, height = 6, 6
    gmap = GraphMap(width, height)

    # 设置障碍边
    gmap.set_block_edge((2, 2), (3, 3))
    gmap.set_block_edge((2, 2), (2, 3))
    gmap.set_edge_weight((1, 1), (1, 2), 5)

    start = (0, 0)
    goal = (5, 5)
    path = nx.dijkstra_path(gmap.graph, start, goal, weight="weight")

    pos = {node: node for node in gmap.graph.nodes()}

    # 正常边的样式
    edge_colors = []
    edge_widths = []
    for u, v in gmap.graph.edges():
        if (u, v) in zip(path, path[1:]):
            edge_colors.append("red")
            edge_widths.append(2.5)
        else:
            edge_colors.append("gray")
            edge_widths.append(1)

    plt.figure(figsize=(8, 8))

    # ✅ 绘制正常边
    nx.draw_networkx_edges(gmap.graph, pos, edge_color=edge_colors, width=edge_widths)

    # ✅ 绘制 blocked 的边（红色虚线）
    for u, v in gmap.blocked_edges:
        x0, y0 = u
        x1, y1 = v
        plt.plot([x0, x1], [y0, y1], color="black", linestyle="dashed", linewidth=2, label="Blocked edge")

    # ✅ 绘制节点
    nx.draw_networkx_nodes(gmap.graph, pos, node_size=100, node_color="lightblue")

    # ✅ 标记起点终点
    plt.scatter(*start, c="green", s=300, label="Start")
    plt.scatter(*goal, c="orange", s=300, label="Goal")

    # ✅ 显示边的权重
    edge_labels = nx.get_edge_attributes(gmap.graph, "weight")
    nx.draw_networkx_edge_labels(gmap.graph, pos, edge_labels=edge_labels, font_size=8)

    plt.title("Grid Graph with Path, Weights, and Blocked Edges")
    plt.legend()
    plt.gca().invert_yaxis()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    test_graph_visual()