const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Prim's Algorithm implementation
function primMST(graph) {
    const V = graph.length;
    const parent = new Array(V);
    const key = new Array(V);
    const mstSet = new Array(V);

    // Initialize all keys as INFINITE and mstSet as false
    for (let i = 0; i < V; i++) {
        key[i] = Infinity;
        mstSet[i] = false;
    }

    // Always include first vertex in MST
    key[0] = 0;
    parent[0] = -1; // First node is always root of MST

    for (let count = 0; count < V - 1; count++) {
        // Pick the minimum key vertex from the set of vertices not yet included in MST
        let u = minKey(key, mstSet, V);
        mstSet[u] = true;

        // Update key value and parent index of the adjacent vertices of the picked vertex
        for (let v = 0; v < V; v++) {
            if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v]) {
                parent[v] = u;
                key[v] = graph[u][v];
            }
        }
    }

    // Format the result as an array of edges
    const result = [];
    for (let i = 1; i < V; i++) {
        if (parent[i] !== undefined && graph[i][parent[i]] !== 0) {
            result.push({
                from: parent[i],
                to: i,
                weight: graph[i][parent[i]]
            });
        }
    }
    return result;
}

function minKey(key, mstSet, V) {
    let min = Infinity;
    let minIndex = -1;

    for (let v = 0; v < V; v++) {
        if (!mstSet[v] && key[v] < min) {
            min = key[v];
            minIndex = v;
        }
    }
    return minIndex;
}

// API endpoint for Prim's algorithm
app.post('/prim', (req, res) => {
    try {
        const graph = req.body.graph;
        if (!graph || !Array.isArray(graph)) {
            return res.status(400).json({ error: 'Invalid graph data' });
        }

        const mst = primMST(graph);
        res.json({ mst });
    } catch (error) {
        console.error('Error in Prim endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});