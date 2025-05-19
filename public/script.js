// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM handles
    const vCountInput = document.getElementById('v-count');
    const fromInput = document.getElementById('e-from');
    const toInput = document.getElementById('e-to');
    const wInput = document.getElementById('e-weight');
    const addBtn = document.getElementById('add-edge');
    const runBtn = document.getElementById('run-btn');
    const edgePre = document.getElementById('edge-list');
    const outputPre = document.getElementById('output');
    const graphDiv = document.getElementById('graph');

    let edges = []; // {from, to, weight}

    // add-edge click - fixed version
    addBtn.addEventListener('click', function() {
        try {
            const v = parseInt(vCountInput.value);
            const f = parseInt(fromInput.value);
            const t = parseInt(toInput.value);
            const w = parseInt(wInput.value);

            // Clear any previous error highlights
            [fromInput, toInput, wInput].forEach(function(input) {
                input.style.backgroundColor = '';
            });

            // Validate inputs
            if (isNaN(f)) {
                fromInput.style.backgroundColor = '#ffdddd';
                throw new Error('"From" must be a number');
            }
            if (isNaN(t)) {
                toInput.style.backgroundColor = '#ffdddd';
                throw new Error('"To" must be a number');
            }
            if (isNaN(w) || w <= 0) {
                wInput.style.backgroundColor = '#ffdddd';
                throw new Error('Weight must be a positive number');
            }
            if (f < 0 || t < 0 || f >= v || t >= v) {
                throw new Error('Vertices must be between 0 and ' + (v-1));
            }
            if (f === t) {
                throw new Error('Cannot create edge from a vertex to itself');
            }

            // Add the edge
            edges.push({from: f, to: t, weight: w});
            renderEdgeList();
            
            // Clear input fields
            fromInput.value = '';
            toInput.value = '';
            wInput.value = '';
            fromInput.focus();
            
        } catch (error) {
            alert(error.message);
        }
    });

    // run-prim click
    runBtn.addEventListener('click', async function() {
        const v = parseInt(vCountInput.value);
        if (v < 2) {
            alert('Need at least 2 vertices');
            return;
        }
        if (edges.length === 0) {
            alert('Add at least one edge');
            return;
        }

        // build adjacency matrix
        const matrix = Array.from({length: v}, function() { 
            return Array(v).fill(0); 
        });
        edges.forEach(function(e) {
            matrix[e.from][e.to] = e.weight;
            matrix[e.to][e.from] = e.weight; // undirected
        });

        try {
            // call server
            const resp = await fetch('/prim', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({graph: matrix})
            });
            
            if (!resp.ok) {
                throw new Error('Server error: ' + resp.status);
            }

            const data = await resp.json();
            outputPre.textContent = JSON.stringify(data.mst, null, 2);
            drawGraph(data.mst, v);
        } catch (error) {
            outputPre.textContent = '❌ Error: ' + error.message;
            console.error(error);
        }
    });

    // show edges
    function renderEdgeList() {
        if (edges.length === 0) {
            edgePre.innerHTML = '<em>No edges yet...</em>';
        } else {
            edgePre.textContent = edges.map(
                function(e, i) { return `${i+1}.  ${e.from}  —${e.weight}→  ${e.to}`; }
            ).join('\n');
        }
    }

    // vis-network graph
    function drawGraph(mstEdges, nodeCount) {
        const nodes = new vis.DataSet(
            Array.from({length: nodeCount}, function(_, i) { 
                return {id: i, label: `${i}`}; 
            })
        );
        const visEdges = new vis.DataSet(
            mstEdges.map(function(e) {
                return {
                    from: e.from,
                    to: e.to,
                    label: `${e.weight}`,
                    font: {align: 'middle'},
                    color: {color: '#ffeb3b'},
                    width: 2
                };
            })
        );
        graphDiv.innerHTML = '';
        new vis.Network(graphDiv, {nodes: nodes, edges: visEdges}, {
            edges: {smooth: {type: 'dynamic'}},
            physics: {stabilization: true}
        });
    }
});