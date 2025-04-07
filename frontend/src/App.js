import React, { useEffect, useState } from "react";
import GraphView from "./components/GraphView";
import DeliveryForm from "./components/DeliveryForm";
import EdgeEditForm from "./components/EdgeEditForm";
import axios from "axios";
import SidePanel from './components/SidePanel';


// frontend文件夹下运行npm start

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [pathResult, setPathResult] = useState(null);

  // 🚀 加载地图节点、边、送货点
  const loadMap = async () => {
    const [resNodes, resEdges, resDeliveries] = await Promise.all([
      axios.get("http://localhost:8000/map/nodes"),
      axios.get("http://localhost:8000/map/edges"),
      axios.get("http://localhost:8000/deliveries"),
    ]);
    setNodes(resNodes.data);
    setEdges(resEdges.data);
    setDeliveries(resDeliveries.data.map(d => d.location));
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
      loadMap(); // 刷新送货点
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

  const handleComputePlan = async () => {
  try {
    const res = await axios.post("http://localhost:8000/compute-plan");
    setPathResult(res.data);  // result: { sequence, arrival_times, total_time }
  } catch (err) {
    console.error(err);
    alert("路径规划失败，可能没有可行解！");
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>🚚 智能配送地图系统</h2>
      <GraphView
        nodes={nodes}
        edges={edges}
        deliveries={deliveries}
        start={[0, 0]}  // 默认起点
        onNodeClick={(node) => {
          setSelectedNode(node);
          setShowForm(true);
        }}
        onEdgeClick={(edge) => setSelectedEdge(edge)}
        pathResult={pathResult}  // 传入路径结果
      />


      <SidePanel onComputePlan={handleComputePlan} />



      {showForm && selectedNode && (
        <DeliveryForm
          x={selectedNode[0]}
          y={selectedNode[1]}
          onSubmit={handleAddDelivery}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectedEdge && (
        <EdgeEditForm
          edge={selectedEdge}
          onSubmit={handleEdgeSubmit}
          onCancel={() => setSelectedEdge(null)}
        />
      )}
    </div>
  );
};

export default App;