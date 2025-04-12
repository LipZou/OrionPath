import React, { useEffect, useState } from "react";
import axios from "axios";

const DeliveryTimeModal = ({ pathResult, onClose }) => {
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [baseTime, setBaseTime] = useState("");
  const [loading, setLoading] = useState(true);

  // Convert minutes offset to actual time
  const convertMinutesToTime = (minutesOffset, baseTime) => {
    const [baseHours, baseMinutes] = baseTime.split(":").map(Number);
    const totalMinutes = baseHours * 60 + baseMinutes + minutesOffset;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch delivery details
        const deliveriesResponse = await axios.get("http://localhost:8000/deliveries");
        const allDeliveries = deliveriesResponse.data;
        
        // Fetch base time
        const baseTimeResponse = await axios.get("http://localhost:8000/base-time");
        const baseTimeValue = baseTimeResponse.data.base_time;
        
        // Create a map of location to time window
        const deliveryMap = {};
        allDeliveries.forEach(delivery => {
          const locationKey = `${delivery.location[0]},${delivery.location[1]}`;
          // Convert minute offsets to actual times
          const earliestTime = convertMinutesToTime(delivery.earliest, baseTimeValue);
          const latestTime = convertMinutesToTime(delivery.latest, baseTimeValue);
          deliveryMap[locationKey] = {
            earliest: earliestTime,
            latest: latestTime,
            // Store original values for tooltip
            originalEarliest: delivery.earliest,
            originalLatest: delivery.latest
          };
        });
        
        setDeliveryDetails(deliveryMap);
        setBaseTime(baseTimeValue);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!pathResult) return null;

  const { sequence, arrival_times, arrival_minutes, total_time } = pathResult;

  // Format total time in hours and minutes
  const formatTotalTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1001,
          maxWidth: "600px",
          width: "90%",
        }}
      >
        <h3 style={{ marginTop: 0 }}>📦 配送时间表</h3>
        
        <div style={{ 
          marginBottom: "15px", 
          padding: "10px", 
          background: "#e6f7ff", 
          borderRadius: "5px",
          border: "1px solid #91d5ff"
        }}>
          <p style={{ margin: "5px 0" }}>出发时间: {baseTime}</p>
        </div>
        
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <p>加载中...</p>
          ) : (
            <>
              <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
                注：时间窗口表示允许送达的时间范围
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>序号</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>位置</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>到达时间</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>
                      允许送达时间
                      <div style={{ fontSize: "12px", fontWeight: "normal", color: "#666" }}>
                        (最早 - 最晚)
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sequence.map((location, index) => {
                    const locationKey = `${location[0]},${location[1]}`;
                    const timeWindow = deliveryDetails[locationKey] || { earliest: "N/A", latest: "N/A" };
                    
                    return (
                      <tr key={index}>
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{index + 1}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                          ({location[0]}, {location[1]})
                        </td>
                        <td style={{ 
                          padding: "10px", 
                          borderBottom: "1px solid #ddd",
                          background: "#f6ffed",  // Light green background
                          fontWeight: "bold"
                        }}>
                          {arrival_times[index]}
                        </td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                          {timeWindow.earliest} - {timeWindow.latest}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
        
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          background: "#f5f5f5", 
          borderRadius: "5px",
          fontWeight: "bold"
        }}>
          <p style={{ margin: "5px 0" }}>总配送时间: {formatTotalTime(total_time)}</p>
        </div>
        
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </>
  );
};

export default DeliveryTimeModal; 