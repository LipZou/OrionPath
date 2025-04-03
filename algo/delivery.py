from typing import Tuple, List
from datetime import datetime

class Delivery:
    def __init__(self, location: Tuple[int, int], time_window: Tuple[str, str], base_time: str = "08:00"):
        """
        :param location: 坐标
        :param time_window: ("08:30", "09:00") 24小时制时间字符串
        :param base_time: 出发时间，默认为 08:00
        """
        self.location = location
        self.earliest, self.latest = self._convert_window(time_window, base_time)

    def _convert_window(self, time_window: Tuple[str, str], base_time: str) -> Tuple[int, int]:
        """
        把两个时间字符串转成偏移分钟数
        """
        base = self._time_str_to_minutes(base_time)
        t1 = self._time_str_to_minutes(time_window[0])
        t2 = self._time_str_to_minutes(time_window[1])
        return t1 - base, t2 - base

    def _time_str_to_minutes(self, time_str: str) -> int:
        """
        "HH:MM" → 分钟数（0点起）
        """
        h, m = map(int, time_str.split(":"))
        return h * 60 + m

    def __repr__(self):
        return f"Delivery({self.location}, time=[{self.earliest}, {self.latest}])"