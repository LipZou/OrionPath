import requests

BASE_URL = "http://localhost:8000"

deliveries = [
    {"location": [2, 1], "time_window": ["08:10", "09:00"]},   # 距离起点 1→2 格，耗时 ≈10min
    {"location": [4, 3], "time_window": ["08:20", "09:10"]},   # 距上一个点 ≈14min
    {"location": [7, 2], "time_window": ["08:40", "09:30"]},   # 合理等待
    {"location": [10, 4], "time_window": ["09:00", "09:50"]},
    {"location": [13, 6], "time_window": ["09:20", "10:10"]},
    {"location": [15, 3], "time_window": ["09:40", "10:30"]},
    {"location": [17, 6], "time_window": ["10:00", "10:50"]},
    {"location": [18, 8], "time_window": ["10:20", "11:10"]},
    {"location": [16, 9], "time_window": ["10:40", "11:30"]},
    {"location": [14, 7], "time_window": ["11:00", "11:50"]}
]
def add_deliveries():
    for i, delivery in enumerate(deliveries):
        res = requests.post(f"{BASE_URL}/add-delivery", json=delivery)
        if res.status_code == 200:
            print(f"✅ 添加第 {i+1} 个送货点: {delivery['location']} 成功")
        else:
            print(f"❌ 添加失败: {delivery['location']}, 返回: {res.text}")

if __name__ == "__main__":
    add_deliveries()