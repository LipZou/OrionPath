from typing import List, Tuple, Dict
from delivery import Delivery
import copy
from datetime import timedelta

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

    def dfs(
        current_point: Tuple[int, int],
        visited: List[bool],
        path: List[Delivery],
        current_time: float,
        arrival_times: List[float],
        depth: int
    ):
        nonlocal best_path, best_time, best_arrival_times

        if depth == n:
            # 所有点访问完了
            if current_time < best_time:
                best_path = copy.deepcopy(path)
                best_time = current_time
                best_arrival_times = copy.deepcopy(arrival_times)
            return

        for i, delivery in enumerate(deliveries):
            if visited[i]:
                continue

            travel_time = distance_matrix.get((current_point, delivery.location), float("inf"))
            if travel_time == float("inf"):
                continue  # 不可达

            arrive_time = current_time + travel_time

            if arrive_time > delivery.latest:
                continue  # 剪枝：超出时间窗

            # 如果早到了，就等到最早可达时间
            arrive_time = max(arrive_time, delivery.earliest)

            # 递归
            visited[i] = True
            path.append(delivery)
            arrival_times.append(arrive_time)

            dfs(delivery.location, visited, path, arrive_time, arrival_times, depth + 1)

            # 回溯
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
