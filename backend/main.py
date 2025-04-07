# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Tuple, List
from delivery_manager import DeliveryManager
from graph_map import GraphMap
from dijkstra import compute_distance_matrix
from planner import find_best_valid_path
from fastapi.middleware.cors import CORSMiddleware

# backend 文件夹调用：uvicorn main:app --reload


# 初始化 FastAPI 应用
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 🔥 只允许你前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化地图和送货管理器
gmap = GraphMap(10, 10)  # 可修改地图大小
delivery_manager = DeliveryManager()


# ✅ 接口用数据模型
class DeliveryRequest(BaseModel):
    x: int
    y: int
    start_time: str  # 例如 "08:30"
    end_time: str    # 例如 "09:00"

class EdgeRequest(BaseModel):
    from_node: Tuple[int, int]
    to_node: Tuple[int, int]

class WeightRequest(BaseModel):
    from_node: Tuple[int, int]
    to_node: Tuple[int, int]
    weight: float

class BaseTimeRequest(BaseModel):
    base_time: str  # 例如 "08:00"


# ✅ 送货点接口
@app.post("/add-delivery")
def add_delivery(req: DeliveryRequest):
    d = delivery_manager.add_delivery(
        (req.x, req.y),
        (req.start_time, req.end_time)
    )
    return {
        "location": d.location,
        "earliest": d.earliest,
        "latest": d.latest
    }

@app.get("/deliveries")
def get_deliveries():
    return delivery_manager.to_dict_list()

@app.post("/remove-delivery")
def remove_delivery(req: DeliveryRequest):
    delivery_manager.remove_delivery((req.x, req.y))
    return {"status": "removed"}

@app.post("/clear-deliveries")
def clear_deliveries():
    delivery_manager.clear_all()
    return {"status": "cleared"}


# ✅ base_time 控制
@app.get("/base-time")
def get_base_time():
    return {"base_time": delivery_manager.get_base_time()}

@app.post("/base-time")
def set_base_time(req: BaseTimeRequest):
    delivery_manager.set_base_time(req.base_time)
    return {"status": "ok", "base_time": req.base_time}


# ✅ 地图接口
@app.get("/map/nodes")
def get_nodes():
    return gmap.get_nodes()

@app.get("/map/edges")
def get_edges():
    return gmap.get_edges()

@app.post("/block-edge")
def toggle_block_edge(req: EdgeRequest):
    return gmap.toggle_block_edge(req.from_node, req.to_node)

@app.post("/set-weight")
def set_edge_weight(req: WeightRequest):
    return gmap.set_edge_weight(req.from_node, req.to_node, req.weight)


# ✅ 调度规划接口
@app.post("/compute-plan")
def compute_plan(start: Tuple[int, int] = (0, 0)):
    deliveries = delivery_manager.get_all()
    key_points = [start] + [d.location for d in deliveries]
    matrix = compute_distance_matrix(gmap, key_points)
    result = find_best_valid_path(start, deliveries, matrix)

    if not result:
        return {"status": "failed", "message": "No valid path found"}

    return {
        "status": "success",
        "sequence": [d.location for d in result["sequence"]],
        "arrival_times": [
            d.format_minutes(result["arrival_times"][i])
            for i, d in enumerate(result["sequence"])
        ],
        "total_time": result["total_time"]
    }