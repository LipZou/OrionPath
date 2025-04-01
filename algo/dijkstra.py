import networkx as nx
from typing import List, Tuple, Dict

from graph_map import GraphMap


def compute_distance_matrix(graph_map: GraphMap, key_points: List[Tuple[int, int]]) -> Dict[Tuple[Tuple[int, int], Tuple[int, int]], float]:
    """
    计算关键点之间的最短路径时间（基于 Dijkstra）

    :param graph_map: GraphMap 对象
    :param key_points: 所有关键点（起点 + 所有目的地）
    :return: 以 (from, to) 为键的最短距离表 {(p1, p2): time}
    """
    distance_matrix = {}

    for source in key_points:
        # 使用 Dijkstra 从 source 出发
        length_dict = nx.single_source_dijkstra_path_length(
            graph_map.graph,
            source=source,
            weight="weight"
        )

        for target in key_points:
            if source == target:
                continue
            if target in length_dict:
                distance_matrix[(source, target)] = round(length_dict[target], 2)
            else:
                # 不可达的情况，设为 None 或 float('inf')
                distance_matrix[(source, target)] = float("inf")

    return distance_matrix