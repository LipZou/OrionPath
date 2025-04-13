import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/DeliveryTimeModal.css";

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
        const [deliveriesResponse, baseTimeResponse] = await Promise.all([
          axios.get("http://localhost:8000/deliveries"),
          axios.get("http://localhost:8000/base-time")
        ]);

        const allDeliveries = deliveriesResponse.data;
        const baseTimeValue = baseTimeResponse.data.base_time;
        
        const deliveryMap = {};
        allDeliveries.forEach(delivery => {
          const locationKey = `${delivery.location[0]},${delivery.location[1]}`;
          const earliestTime = convertMinutesToTime(delivery.earliest, baseTimeValue);
          const latestTime = convertMinutesToTime(delivery.latest, baseTimeValue);
          deliveryMap[locationKey] = {
            earliest: earliestTime,
            latest: latestTime,
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

  const { sequence, arrival_times, total_time } = pathResult;

  const formatTotalTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            <span role="img" aria-label="delivery package">📦</span>
            Delivery Schedule
          </h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="departure-section">
          <div className="departure-label">Departure</div>
          <span className="departure-time">{baseTime}</span>
        </div>
        
        <div className="deliveries-container">
          {loading ? (
            <div className="loading-container">
              Loading...
            </div>
          ) : (
            <>
              <div className="info-note">
                Note: Delivery window shows the allowed delivery time range
              </div>
              <table className="deliveries-table">
                <thead>
                  <tr className="table-header">
                    <th>No.</th>
                    <th>Location</th>
                    <th>Arrival</th>
                    <th>Delivery Window</th>
                  </tr>
                </thead>
                <tbody>
                  {sequence.map((location, index) => {
                    const locationKey = `${location[0]},${location[1]}`;
                    const timeWindow = deliveryDetails[locationKey] || { earliest: "N/A", latest: "N/A" };
                    
                    return (
                      <tr key={index} className="delivery-row">
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td className="location-cell">({location[0]}, {location[1]})</td>
                        <td className="arrival-cell">{arrival_times[index]}</td>
                        <td className="window-cell">
                          <div className="time-window-badge">
                            {timeWindow.earliest} - {timeWindow.latest}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
        
        <div className="total-time-section">
          <div className="total-time-label">
            <span style={{ fontWeight: "500" }}>Total Delivery Time:</span>
            <span className="total-time-value">{formatTotalTime(total_time)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryTimeModal; 