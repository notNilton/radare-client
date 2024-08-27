// ReconciliationUtils.js
export const createAdjacencyMatrix = (nodes: any[], edges: any[]) => {
  const cnOneTwoNodes = nodes.filter((node) => node.type === "cnOneTwo");
  const incidencematrix = Array.from({ length: cnOneTwoNodes.length }, () =>
    Array(edges.length).fill(0)
  );

  edges.forEach((edge, edgeIndex) => {
    const sourceIndex = cnOneTwoNodes.findIndex(
      (node) => node.id === edge.source
    );
    const targetIndex = cnOneTwoNodes.findIndex(
      (node) => node.id === edge.target
    );

    if (sourceIndex !== -1) incidencematrix[sourceIndex][edgeIndex] = -1;
    if (targetIndex !== -1) incidencematrix[targetIndex][edgeIndex] = 1;
  });

  return incidencematrix;
};

export const calcularReconciliacao = (
  nodes: any[],
  edges: any[],
  reconciliarApi: {
    (
      incidenceMatrix: any,
      values: any,
      tolerances: any,
      names: any[],
      atualizarProgresso: any
    ): Promise<void>;
    (
      arg0: any[][],
      arg1: any,
      arg2: any,
      arg3: any,
      arg4: any[]
    ): void;
  },
  atualizarProgresso: { (message: string): void; (arg0: string): void },
  edgeNames: any[]
) => {
  const value = edges.map((edge) => edge.value); // Captura os valores
  const tolerance = edges.map((edge) => edge.tolerance); // Captura as tolerâncias

  const incidencematrix = createAdjacencyMatrix(nodes, edges); // Gera a matriz de adjacência

  // Exibe os valores capturados no console
  console.log("Valores de Medida:", value);
  console.log("Valores de Tolerância:", tolerance);
  console.log("Nomes das Arestas:", edgeNames);
  console.log("Matriz de Adjacência:", incidencematrix);

  // Se necessário, você ainda pode chamar a API de reconciliação aqui
  atualizarProgresso("Chamando API de reconciliação...");
  reconciliarApi(incidencematrix, value, tolerance, edgeNames, atualizarProgresso);
};

export const reconciliarApi = async (
  incidence_matrix: any,
  values: any,
  tolerances: any,
  names: any[],
  atualizarProgresso: (arg0: string) => void
) => {
  try {
    atualizarProgresso("Enviando dados para o servidor...");

    // Criação do timestamp
    const timestamp = new Date().toISOString();

    // Criação do ID único
    const id = `reconciliation_${Date.now()}`;

    // Criação do pacote de dados
    const pacote = {
      data: {
        id,
        description: "Reconciliation for Q3 financial data across departments", // Descrição fixa, pode ser alterada dinamicamente
        user: "John Doe", // Usuário fixo, pode ser alterado dinamicamente
        timestamp,
        names, // Lista de nomes
        incidence_matrix, // Matriz de incidência
        unreconciledata: [
          {
            values, // Valores não reconciliados
            tolerances, // Tolerâncias
          },
        ],
      },
    };

    // Loga o pacote no console antes de enviá-lo
    console.log("Pacote a ser enviado:", JSON.stringify(pacote, null, 2));

    // Envio do pacote para o servidor
    const response = await fetch("http://localhost:5000/reconcile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pacote),
    });

    if (response.ok) {
      const data = await response.json();

      console.log("Dados recebidos:", data);

      const reconciledData = JSON.stringify(data.data.reconciledata, null, 2);

      console.log("Dados Reconciliados:", reconciledData);

      // Armazena os dados no localStorage
      const storedData = {
        id: data.data.id,
        reconciledata: data.data.reconciledata,
        names: data.data.names,
        timestamp: data.data.timestamp,
        description: data.data.description,
        user: data.data.user,
      };

      console.log(storedData);

      localStorage.setItem(data.data.id, JSON.stringify(storedData));
      window.dispatchEvent(new Event("storage"));

      atualizarProgresso(
        `Reconciliação bem-sucedida.\n\nDados Reconciliados: ${reconciledData}`
      );
    } else {
      console.error("Falha na reconciliação dos dados");
      atualizarProgresso("Falha na reconciliação.");
    }
  } catch (error) {
    console.error("Erro ao reconciliar dados:", error);
    atualizarProgresso("Erro durante a reconciliação.");
  }
};
