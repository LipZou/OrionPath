from typing import List, Tuple, Dict
from delivery import Delivery
import copy

def estimate_remaining_cost(current_point, deliveries, visited, distance_matrix):
    """
    估算当前点到所有未访问点的最小路径耗时总和（用于启发剪枝）
    """
    remaining = 0
    for i, d in enumerate(deliveries):
        if not visited[i]:
            dist = distance_matrix.get((current_point, d.location), float("inf"))
            remaining += dist
    return remaining

def construct_greedy_path(start, deliveries, distance_matrix, start_time):
    """
    使用贪心策略构造一个初始可行路径，返回其耗时和到达时间列表
    """
    visited = [False] * len(deliveries)
    path = []
    arrival_times = []
    current = start
    time = start_time

    for _ in range(len(deliveries)):
        best_idx = -1
        best_score = float("inf")
        for i, d in enumerate(deliveries):
            if visited[i]:
                continue
            dist = distance_matrix.get((current, d.location), float("inf"))
            if dist == float("inf"):
                continue
            arrive = time + dist
            if arrive > d.latest:
                continue
            wait = max(arrive, d.earliest)
            if wait < best_score:
                best_score = wait
                best_idx = i

        if best_idx == -1:
            return None  # 没有合法路径

        visited[best_idx] = True
        path.append(deliveries[best_idx])
        arrival_times.append(best_score)
        current = deliveries[best_idx].location
        time = best_score

    return time, path, arrival_times

def find_best_valid_path(
    start: Tuple[int, int],
    deliveries: List[Delivery],
    distance_matrix: Dict[Tuple, float],
    start_time: int = 0
) -> Dict:

    n = len(deliveries)
    best_path = None
    best_time = float("inf")
    best_arrival_times = []

    # ✅ 使用贪心初始化 best_time
    greedy_result = construct_greedy_path(start, deliveries, distance_matrix, start_time)
    if greedy_result:
        best_time, best_path, best_arrival_times = greedy_result
        best_path = copy.deepcopy(best_path)
        best_arrival_times = copy.deepcopy(best_arrival_times)

    # ✅ 按 earliest 时间 + 距离排序
    sorted_indices = sorted(
        range(n),
        key=lambda i: (deliveries[i].earliest, distance_matrix.get((start, deliveries[i].location), float("inf")))
    )
    sorted_deliveries = [deliveries[i] for i in sorted_indices]

    def dfs(current_point, visited, path, current_time, arrival_times, depth):
        nonlocal best_path, best_time, best_arrival_times

        if depth == n:
            if current_time < best_time:
                best_time = current_time
                best_path = copy.deepcopy(path)
                best_arrival_times = copy.deepcopy(arrival_times)
            return

        for i, delivery in enumerate(sorted_deliveries):
            if visited[i]:
                continue

            travel_time = distance_matrix.get((current_point, delivery.location), float("inf"))
            if travel_time == float("inf"):
                continue

            arrive_time = current_time + travel_time
            if arrive_time > delivery.latest:
                continue

            real_arrival = max(arrive_time, delivery.earliest)

            # ✂️ 强剪枝：剩余估计+当前时间超过最优路径
            estimate_rest = estimate_remaining_cost(delivery.location, sorted_deliveries, visited, distance_matrix)
            if real_arrival + estimate_rest >= best_time:
                continue

            visited[i] = True
            path.append(delivery)
            arrival_times.append(real_arrival)

            dfs(delivery.location, visited, path, real_arrival, arrival_times, depth + 1)

            visited[i] = False
            path.pop()
            arrival_times.pop()

    visited = [False] * n
    dfs(start, visited, [], start_time, [], 0)

    if best_path is None:
        return None
    return {
        "sequence": best_path,
        "arrival_times": best_arrival_times,
        "total_time": best_time
    }