import requests

BASE_URL = "http://localhost:8000"

deliveries = [
  { "location": [1, 1], "time_window": ["08:05", "09:00"] },
  { "location": [2, 1], "time_window": ["08:10", "09:05"] },
  { "location": [3, 1], "time_window": ["08:15", "09:10"] },
  { "location": [4, 1], "time_window": ["08:20", "09:15"] },
  { "location": [5, 1], "time_window": ["08:25", "09:20"] },
  { "location": [6, 2], "time_window": ["08:30", "09:25"] },
  { "location": [7, 2], "time_window": ["08:35", "09:30"] },
  { "location": [8, 3], "time_window": ["08:40", "09:35"] },
  { "location": [9, 3], "time_window": ["08:45", "09:40"] },
  { "location": [10, 3], "time_window": ["08:50", "09:45"] },
  { "location": [11, 3], "time_window": ["08:55", "09:50"] },
  { "location": [12, 4], "time_window": ["09:00", "09:55"] },
  { "location": [13, 4], "time_window": ["09:05", "10:00"] },
  { "location": [14, 5], "time_window": ["09:10", "10:05"] },
  { "location": [15, 5], "time_window": ["09:15", "10:10"] },
  { "location": [16, 5], "time_window": ["09:20", "10:15"] },
  { "location": [17, 6], "time_window": ["09:25", "10:20"] },
  { "location": [18, 6], "time_window": ["09:30", "10:25"] },
  { "location": [19, 6], "time_window": ["09:35", "10:30"] },
  { "location": [19, 7], "time_window": ["09:40", "10:35"] },
  { "location": [18, 7], "time_window": ["09:45", "10:40"] },
  { "location": [17, 7], "time_window": ["09:50", "10:45"] },
  { "location": [16, 8], "time_window": ["09:55", "10:50"] },
  { "location": [15, 8], "time_window": ["10:00", "10:55"] },
  { "location": [14, 8], "time_window": ["10:05", "11:00"] },
  { "location": [13, 9], "time_window": ["10:10", "11:05"] },
  { "location": [12, 9], "time_window": ["10:15", "11:10"] },
  { "location": [11, 9], "time_window": ["10:20", "11:15"] },
  { "location": [10, 9], "time_window": ["10:25", "11:20"] },
  { "location": [9, 8],  "time_window": ["10:30", "11:25"] },
  { "location": [8, 8],  "time_window": ["10:35", "11:30"] },
  { "location": [7, 7],  "time_window": ["10:40", "11:35"] },
  { "location": [6, 7],  "time_window": ["10:45", "11:40"] },
  { "location": [5, 6],  "time_window": ["10:50", "11:45"] },
  { "location": [4, 6],  "time_window": ["10:55", "11:50"] },
  { "location": [3, 6],  "time_window": ["11:00", "11:55"] },
  { "location": [2, 5],  "time_window": ["11:05", "12:00"] },
  { "location": [1, 5],  "time_window": ["11:10", "12:05"] },
  { "location": [0, 5],  "time_window": ["11:15", "12:10"] },
  { "location": [0, 6],  "time_window": ["11:20", "12:15"] },
  { "location": [1, 7],  "time_window": ["11:25", "12:20"] },
  { "location": [2, 8],  "time_window": ["11:30", "12:25"] },
  { "location": [3, 8],  "time_window": ["11:35", "12:30"] },
  { "location": [4, 8],  "time_window": ["11:40", "12:35"] },
  { "location": [5, 9],  "time_window": ["11:45", "12:40"] },
  { "location": [6, 9],  "time_window": ["11:50", "12:45"] },
  { "location": [7, 9],  "time_window": ["11:55", "12:50"] },
  { "location": [8, 9],  "time_window": ["12:00", "12:55"] },
  { "location": [9, 9],  "time_window": ["12:05", "13:00"] }
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