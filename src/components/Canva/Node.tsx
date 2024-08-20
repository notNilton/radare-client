import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
  Controls,
  Panel,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import "./Node.scss";

import {
  initialNodes,
  initialEdges,
  nodeTypes,
} from "./utils/initialCanvaDataIII";
import { calcularReconciliacao, reconciliarApi } from "./utils/Reconciliacao";
import SidebarComponent from "../Sidebar/SidebarComponent";
import GraphComponent from "../Dashboard/GraphComponent";
import PanelButtons from "./PanelButtons"; // Importando o novo componente

const generateRandomName = () => {
  const names = ["Laravel", "Alucard", "Sigma", "Delta", "Orion", "Phoenix"];
  return names[Math.floor(Math.random() * names.length)];
};

const getNodeId = () => `randomnode_${+new Date()}`;

const Node: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map((edge) => ({
      ...edge,
      nome: edge.nome || generateRandomName(),
      label: `Nome: ${edge.nome || generateRandomName()}, Valor: ${
        edge.value
      }, Tolerância: ${edge.tolerance}`,
      type: "step",
    }))
  );

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isGraphVisible, setIsGraphVisible] = useState(true);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const addNode = useCallback(
    (nodeType: string) => {
      const newNode = {
        id: getNodeId(),
        type: nodeType,
        data: { label: "Simples", isConnectable: true },
        style: {
          background: "white",
          border: "2px solid black",
          padding: "3px",
          width: "100px",
        },
        position: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/reconcile", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Upload bem-sucedido:", result);
        } else {
          console.error("Falha no upload:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao enviar o arquivo:", error);
      }
    }
  };

  const handleReconcile = () => {
    calcularReconciliacao(nodes, edges, reconciliarApi, (message) => {
      console.log(message);
    });
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleGraph = () => {
    setIsGraphVisible(!isGraphVisible);
  };

  const showNodesAndEdges = () => {
    console.log("Nodes:", nodesRef.current);
    console.log("Edges:", edgesRef.current);
    alert(
      `Nodes: ${JSON.stringify(nodesRef.current, null, 2)}\nEdges: ${JSON.stringify(edgesRef.current, null, 2)}`
    );
  };

  const edgeNames = edges.map((edge) => edge.nome);

  return (
    <div className={`node-container ${isSidebarVisible ? "" : "sidebar-hidden"}`}>
      <div className="reactflow-component">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={addEdge}
          nodeTypes={nodeTypes}
          fitView
        >
          <Panel position="top-left" className="top-left-panel custom-panel">
            <PanelButtons
              addNode={addNode}
              showNodesAndEdges={showNodesAndEdges}
              toggleSidebar={toggleSidebar}
              toggleGraph={toggleGraph}
              handleReconcile={handleReconcile}
              handleFileUpload={handleFileUpload}
              isSidebarVisible={isSidebarVisible}
              isGraphVisible={isGraphVisible}
            />
          </Panel>
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {isSidebarVisible && (
          <div className="sidebar-component">
            <SidebarComponent nodes={nodes} edges={edges} edgeNames={edgeNames} />
          </div>
        )}
      </div>

      {isGraphVisible && (
        <div className="graph-component">
          <GraphComponent nodes={nodes} edges={edges} edgeNames={edgeNames} />
        </div>
      )}
    </div>
  );
};

export default Node;
