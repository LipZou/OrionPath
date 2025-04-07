# delivery_manager.py

from typing import List, Tuple
from delivery import Delivery

class DeliveryManager:
    def __init__(self, base_time: str = "08:00"):
        """
        管理送货任务的类，统一 base_time，并存储所有 Delivery 实例
        """
        self.deliveries: List[Delivery] = []
        self.base_time = base_time

    def set_base_time(self, base_time: str):
        """设置统一的出发时间（如 08:00）"""
        self.base_time = base_time

    def get_base_time(self) -> str:
        """返回当前 base_time"""
        return self.base_time

    def add_delivery(self, location: Tuple[int, int], time_window: Tuple[str, str]) -> Delivery:
        """
        添加一个送货点任务（坐标 + 时间窗）
        """
        d = Delivery(location, time_window, base_time=self.base_time)
        self.deliveries.append(d)
        return d

    def remove_delivery(self, location: Tuple[int, int]):
        """
        移除指定位置的送货点（按坐标）
        """
        self.deliveries = [d for d in self.deliveries if d.location != location]

    def clear_all(self):
        """清空所有送货点"""
        self.deliveries.clear()

    def get_all(self) -> List[Delivery]:
        """获取所有送货点任务"""
        return self.deliveries

    def exists(self, location: Tuple[int, int]) -> bool:
        """判断某个位置是否已被添加为送货点"""
        return any(d.location == location for d in self.deliveries)

    def to_dict_list(self) -> List[dict]:
        """返回 JSON 友好的格式（用于前端展示或调试）"""
        return [{
            "location": d.location,
            "earliest": d.earliest,
            "latest": d.latest
        } for d in self.deliveries]