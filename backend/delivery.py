from typing import Tuple

class Delivery:
    def __init__(self, location: Tuple[int, int], time_window: Tuple[str, str], base_time: str = "08:00"):
        """
        :param location: 坐标
        :param time_window: ("08:30", "09:00") 24小时制时间字符串
        :param base_time: 出发时间，默认 08:00
        """
        self.location = location
        self.base_hour, self.base_minute = map(int, base_time.split(":"))
        self.earliest, self.latest = self._convert_window(time_window)

    def _convert_window(self, time_window: Tuple[str, str]) -> Tuple[int, int]:
        """
        把时间窗字符串转为偏移分钟数
        """
        base_minutes = self.base_hour * 60 + self.base_minute
        t1 = self._time_str_to_minutes(time_window[0]) - base_minutes
        t2 = self._time_str_to_minutes(time_window[1]) - base_minutes
        return t1, t2

    def _time_str_to_minutes(self, time_str: str) -> int:
        h, m = map(int, time_str.split(":"))
        return h * 60 + m

    def format_minutes(self, minutes: int) -> str:
        """
        把分钟偏移量转换为 24 小时格式字符串
        """
        total = self.base_hour * 60 + self.base_minute + int(minutes)
        h, m = divmod(total, 60)
        return f"{h:02d}:{m:02d}"

    def __repr__(self):
        return f"Delivery({self.location}, time=[{self.earliest}, {self.latest}])"