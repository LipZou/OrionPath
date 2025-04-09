from delivery import Delivery
from graph_map import GraphMap
from dijkstra import compute_distance_matrix
from planner import find_best_valid_path

def test_dfs_path_planning():
    # ✅ 1. 构建地图
    gmap = GraphMap(10, 10)

    # ✅ 2. 添加障碍（可选）
    # gmap.set_block_edge((2, 2), (3, 3))
    # gmap.set_block_edge((1, 1), (1, 2))

    # ✅ 3. 设置送货目标（位置 + 时间窗）
    deliveries = [
        Delivery((5, 2), ("08:30", "09:30")),
        Delivery((9, 9), ("08:30", "09:30"))
    ]

    start = (0, 0)

    # ✅ 4. 构建关键点矩阵
    key_points = [start] + [d.location for d in deliveries]
    matrix = compute_distance_matrix(gmap, key_points)

    # ✅ 5. 路径规划
    result = find_best_valid_path(start, deliveries, matrix)

    # ✅ 6. 打印结果
    print("\n====== 路径搜索结果 ======")
    if result:
        print("✅ 找到可行路径！")
        for i, d in enumerate(result["sequence"]):
            time_str = d.format_minutes(result["arrival_times"][i])
            print(f"{i + 1}. {d} 到达时间 = {time_str}")
        print(f"总耗时：{result['total_time']} 分钟")
    else:
        print("❌ 没有可行路径满足所有时间窗")

    # ✅ 7. 可视化地图 + 路径 + 时间窗
    gmap.visualize(deliveries, start=start, path_result=result)

if __name__ == "__main__":
    test_dfs_path_planning()