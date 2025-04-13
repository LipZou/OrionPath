import React, { useEffect, useState } from "react";
import GraphView from "./components/GraphView";
import DeliveryForm from "./components/DeliveryForm";
import EdgeEditForm from "./components/EdgeEditForm";
import DeliveryTimeModal from "./components/DeliveryTimeModal";
import axios from "axios";
import SidePanel from "./components/SidePanel";

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [pathResult, setPathResult] = useState(null);
  const [deliveryOrder, setDeliveryOrder] = useState([]);
  const [showDeliveryTimeModal, setShowDeliveryTimeModal] = useState(false);
  const [mode, setMode] = useState('delivery'); // 'delivery' or 'edge'
  const start = [0, 0];

  // 🚀 加载地图节点、边、送货点
  const loadMap = async () => {
    try {
      const [resNodes, resEdges, resDeliveries] = await Promise.all([
        axios.get("http://localhost:8000/map/nodes"),
        axios.get("http://localhost:8000/map/edges"),
        axios.get("http://localhost:8000/deliveries"),
      ]);
      setNodes(resNodes.data);
      setEdges(resEdges.data);
      setDeliveries(resDeliveries.data.map((d) => d.location));
    } catch (err) {
      console.error("地图加载失败：", err);
    }
  };

  useEffect(() => {
    loadMap();
  }, []);

  // 📦 添加送货点
  const handleAddDelivery = async (data) => {
    try {
      await axios.post("http://localhost:8000/add-delivery", data);
      alert("送货点添加成功！");
      setShowForm(false);
      loadMap();
    } catch (err) {
      console.error(err);
      alert("添加失败");
    }
  };

  // 🛣️ 修改边信息（封路/耗时）
  const handleEdgeSubmit = async ({ from, to, weight, blocked }) => {
    try {
      if (blocked) {
        await axios.post("http://localhost:8000/block-edge", { from_node: from, to_node: to });
      } else {
        await axios.post("http://localhost:8000/set-weight", { from_node: from, to_node: to, weight });
      }
      setSelectedEdge(null);
      loadMap();
    } catch (err) {
      console.error(err);
      alert("修改边失败");
    }
  };

  // ❌ 删除送货点
  const handleDeleteDelivery = async (location) => {
    try {
      await axios.post("http://localhost:8000/remove-delivery", { location });
      alert("送货点已删除");
      setShowForm(false);
      loadMap();
    } catch (err) {
      console.error(err);
      alert("删除失败");
    }
  };

  // 🧹 清空送货点
  const handleClearDeliveries = async () => {
    try {
      await axios.post("http://localhost:8000/clear-deliveries");
      alert("已清空所有送货点");
      setPathResult(null); // 清除路径
      setDeliveryOrder([]); // 清除送货顺序
      loadMap();
    } catch (err) {
      console.error(err);
      alert("清空失败");
    }
  };

  // 🔍 请求后端规划路径
  const handleComputePlan = async () => {
    try {
      const res = await axios.post("http://localhost:8000/compute-plan");
      const baseResult = res.data;
      const deliverySequence = baseResult.sequence.map((coord, index) => ({
        x: coord[0],
        y: coord[1],
        order: index + 1,
      }));
      setDeliveryOrder(deliverySequence);

      if (!baseResult || baseResult.status !== "success") {
        alert("❌ 后端未找到可行路径！");
        return;
      }

      const sequence = [start, ...baseResult.sequence];
      const realPath = await fetchFullPath(sequence);

      if (!realPath || realPath.length === 0) {
        alert("❌ 无法构造完整路径！");
        return;
      }

      setPathResult({
        ...baseResult,
        full_path: realPath,
      });
      
      // Show the delivery time modal
      setShowDeliveryTimeModal(true);

    } catch (err) {
      console.error("路径规划失败：", err);
      alert("路径规划失败！");
    }
  };

  // 🚗 获取完整路径段（点对点）
  const fetchFullPath = async (sequence) => {
    const fullPath = [];

    for (let i = 0; i < sequence.length - 1; i++) {
      const from = sequence[i];
      const to = sequence[i + 1];

      try {
        const res = await axios.get("http://localhost:8000/shortest-path", {
          params: {
            from: from.join(","),
            to: to.join(","),
          },
        });

        const pathSegment = res.data?.path;
        if (!Array.isArray(pathSegment) || pathSegment.length === 0) {
          console.warn("⚠️ 无法获取路径段：", from, "→", to);
          continue;
        }

        if (fullPath.length === 0) {
          fullPath.push(...pathSegment);
        } else {
          fullPath.push(...pathSegment.slice(1)); // 避免重复
        }
      } catch (err) {
        console.error("路径段请求失败：", from, to, err);
      }
    }

    return fullPath;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🚚 Intelligent Delivery Map System</h2>

      <GraphView
        nodes={nodes}
        edges={edges}
        deliveries={deliveries}
        start={start}
        pathResult={pathResult}
        deliveryOrder={deliveryOrder}
        onNodeClick={(node) => {
          if (mode === 'delivery') {
            setSelectedNode(node);
            setShowForm(true);
          }
        }}
        onEdgeClick={(edge) => {
          if (mode === 'edge') {
            setSelectedEdge(edge);
          }
        }}
      />

      <SidePanel
        mode={mode}
        setMode={setMode}
        onComputePlan={handleComputePlan}
        onClearAll={handleClearDeliveries}
      />

      {showForm && selectedNode && (
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
            onClick={() => setShowForm(false)}
          />
          <DeliveryForm
            x={selectedNode[0]}
            y={selectedNode[1]}
            onSubmit={handleAddDelivery}
            onDelete={handleDeleteDelivery}
            onCancel={() => setShowForm(false)}
          />
        </>
      )}

      {selectedEdge && (
        <EdgeEditForm
          edge={selectedEdge}
          onSubmit={handleEdgeSubmit}
          onCancel={() => setSelectedEdge(null)}
        />
      )}

      {showDeliveryTimeModal && (
        <DeliveryTimeModal
          pathResult={pathResult}
          onClose={() => setShowDeliveryTimeModal(false)}
        />
      )}
    </div>
  );
};

export default App;