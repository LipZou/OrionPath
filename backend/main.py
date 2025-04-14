from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple, Dict
from graph_map import GraphMap
from delivery_manager import DeliveryManager
from dijkstra import compute_distance_matrix
from planner import find_best_valid_path
import networkx as nx
import time  # ✅ 加上这一行

# 初始化 FastAPI 应用
app = FastAPI()

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化组件
gmap = GraphMap(20, 10)
delivery_manager = DeliveryManager()

# ===============================
# ✅ 请求模型定义
# ===============================
class DeliveryInput(BaseModel):
    location: List[int]
    time_window: List[str]

class LocationInput(BaseModel):
    location: List[int]

class BaseTimeRequest(BaseModel):
    base_time: str

class EdgeRequest(BaseModel):
    from_node: Tuple[int, int]
    to_node: Tuple[int, int]

class WeightRequest(BaseModel):
    from_node: Tuple[int, int]
    to_node: Tuple[int, int]
    weight: float

# ===============================
# ✅ 地图相关接口
# ===============================
@app.get("/map/nodes")
def get_nodes():
    return gmap.get_nodes()

@app.get("/map/edges")
def get_edges():
    return gmap.get_edges()

@app.post("/block-edge")
def block_edge(req: EdgeRequest):
    return gmap.toggle_block_edge(req.from_node, req.to_node)

@app.post("/set-weight")
def set_edge_weight(req: WeightRequest):
    return gmap.set_edge_weight(req.from_node, req.to_node, req.weight)

@app.get("/shortest-path")
def get_shortest_path(from_: str = Query(..., alias="from"), to: str = Query(...)):
    try:
        from_node = tuple(map(int, from_.split(",")))
        to_node = tuple(map(int, to.split(",")))

        # ✅ 使用 networkx 提供的最短路径方法
        path = nx.dijkstra_path(gmap.graph, source=from_node, target=to_node, weight="weight")
        total_time = nx.dijkstra_path_length(gmap.graph, source=from_node, target=to_node, weight="weight")

        return {
            "path": path,
            "total_time": round(total_time, 2)
        }
    except nx.NetworkXNoPath:
        return {"path": [], "total_time": float("inf")}
    except Exception as e:
        return {"error": str(e)}

# ===============================
# ✅ 送货点接口
# ===============================
@app.post("/add-delivery")
def add_delivery(data: DeliveryInput):
    location = tuple(data.location)
    time_window = tuple(data.time_window)
    delivery_manager.add_delivery(location, time_window)
    return {"status": "ok"}

@app.post("/remove-delivery")
def remove_delivery(data: LocationInput):
    location = tuple(data.location)
    delivery_manager.remove_delivery(location)
    return {"status": "ok"}

@app.post("/clear-deliveries")
def clear_deliveries():
    delivery_manager.clear_all()
    return {"status": "cleared"}

@app.get("/deliveries")
def get_deliveries():
    return delivery_manager.to_dict_list()

@app.post("/base-time")
def set_base_time(data: BaseTimeRequest):
    delivery_manager.set_base_time(data.base_time)
    return {"status": "ok"}

@app.get("/base-time")
def get_base_time():
    return {"base_time": delivery_manager.get_base_time()}

# ===============================
# ✅ 路径规划接口
# ===============================
@app.post("/compute-plan")
def compute_plan(start: Tuple[int, int] = (0, 0)):
    deliveries = delivery_manager.get_all()
    key_points = [start] + [d.location for d in deliveries]
    matrix = compute_distance_matrix(gmap, key_points)

    print("\n====== 🧪 路径调试信息 ======")
    print(f"起点：{start}")
    print("送货点：")
    for i, d in enumerate(deliveries):
        print(f"  {i+1}. {d.location} 时间窗 = [{d.earliest}, {d.latest}]")

    print("\n距离矩阵：")
    for (src, dst), dist in matrix.items():
        print(f"  {src} → {dst} = {dist:.2f}")

    # ✅ 开始计时
    start_time = time.time()

    result = find_best_valid_path(start, deliveries, matrix)

    # ✅ 结束计时
    elapsed = time.time() - start_time

    if not result:
        print("❌ 没有可行路径！")
        print(f"🕒 耗时：{elapsed:.2f} 秒")
        return {"status": "failed", "message": "No valid path found"}

    print("\n✅ 可行路径：")
    for i, d in enumerate(result["sequence"]):
        time_str = d.format_minutes(result["arrival_times"][i])
        print(f"  {i+1}. {d.location} 到达时间 = {time_str}")
    print(f"🕒 总耗时：{result['total_time']} 分钟")
    print(f"⏱️ 规划耗时（秒）：{elapsed:.6f}")
    print("=====================================\n")

    return {
        "status": "success",
        "sequence": [d.location for d in result["sequence"]],
        "arrival_times": [
            d.format_minutes(result["arrival_times"][i])
            for i, d in enumerate(result["sequence"])
        ],
        "arrival_minutes": result["arrival_times"],
        "total_time": result["total_time"]
    }