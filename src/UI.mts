export default () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universe Explorer</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%);
            color: #e0e0e0;
            line-height: 1.6;
            overflow-x: hidden;
        }
        header {
            background: #16213e;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        header h1 {
            font-size: 2rem;
            color: #00d4ff;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        nav {
            display: flex;
            justify-content: center;
            background: #1e2a44;
            padding: 0.5rem;
        }
        nav button {
            margin: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #34495e;
            color: #fff;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        nav button:hover {
            background: #00b4d8;
            transform: translateY(-2px);
        }
        nav button.active {
            background: #00d4ff;
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.7);
        }
        main {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        section {
            background: #1e2a44;
            padding: 2rem;
            border-radius: 15px;
            margin-bottom: 2rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            display: none;
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h2 {
            color: #00d4ff;
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin: 0.5rem 0 0.2rem;
            color: #a0b4d8;
        }
        input, select {
            width: 100%;
            padding: 0.75rem;
            margin-bottom: 1rem;
            background: #2c3e50;
            color: #e0e0e0;
            border: 1px solid #34495e;
            border-radius: 8px;
            transition: border-color 0.3s ease;
        }
        input:focus {
            border-color: #00d4ff;
            outline: none;
            box-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
        }
        button {
            padding: 0.75rem 1.5rem;
            background: #00b4d8;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        button:hover {
            background: #0093b5;
        }
        .thing-input {
            background: #26334a;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            background: #26334a;
        }
        th, td {
            padding: 1rem;
            border: 1px solid #34495e;
            text-align: left;
        }
        th {
            background: #34495e;
            color: #00d4ff;
        }
        td {
            color: #e0e0e0;
        }
        #message {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            display: none;
            animation: slideUp 0.3s ease-in-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        #token-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        #token-modal div {
            background: #1e2a44;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 212, 255, 0.2);
        }
        #token-modal h2 {
            margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
            nav {
                flex-direction: column;
            }
            nav button {
                margin: 0.5rem 0;
                width: 100%;
            }
            section {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Universe Explorer</h1>
    </header>
    <nav>
        <button id="emit-btn">Emit</button>
        <button id="resonate-btn">Resonate</button>
        <button id="manage-btn">Manage</button>
    </nav>
    <main>
        <section id="emit-section">
            <h2>Emit Things</h2>
            <label for="emit-universe">Universe:</label>
            <input type="text" id="emit-universe" list="universe-list" placeholder="e.g., my_universe" />
            <datalist id="universe-list"></datalist>
            <div id="things-container">
                <div class="thing-input">
                    <label>Thing Text:</label>
                    <input type="text" class="thing-text" placeholder="Enter your thing here" />
                    <label>Optional ID:</label>
                    <input type="text" class="thing-id" placeholder="e.g., thing1" />
                </div>
            </div>
            <button id="add-thing-btn">Add More Things</button>
            <button id="emit-submit-btn">Emit Now</button>
        </section>
        <section id="resonate-section">
            <h2>Resonate with Things</h2>
            <label for="resonate-universe">Universe:</label>
            <input type="text" id="resonate-universe" list="universe-list" placeholder="e.g., my_universe" />
            <label for="resonate-text">Text to Resonate With:</label>
            <input type="text" id="resonate-text" placeholder="What to find?" />
            <label for="resonate-reach">Reach (Number of Results):</label>
            <input type="number" id="resonate-reach" value="10" min="1" />
            <button id="resonate-submit-btn">Resonate</button>
            <div id="resonate-results"></div>
        </section>
        <section id="manage-section">
            <h2>Manage Things</h2>
            <label for="manage-universe">Universe:</label>
            <input type="text" id="manage-universe" list="universe-list" placeholder="e.g., my_universe" />
            <label for="delete-id">Thing ID to Delete:</label>
            <input type="text" id="delete-id" placeholder="e.g., thing1" />
            <button id="delete-thing-btn">Delete Thing</button>
            <button id="clear-universe-btn">Clear Universe</button>
        </section>
    </main>
    <div id="message"></div>
    <div id="token-modal">
        <div>
            <h2>Welcome to Universe</h2>
            <p>Please enter your bearer token to begin:</p>
            <input type="text" id="token-input" placeholder="Your token here" />
            <button id="save-token-btn">Save & Start Exploring</button>
        </div>
    </div>

    <script>
        // Token Handling
        const token = localStorage.getItem('bearerToken');
        if (!token) {
            document.getElementById('token-modal').style.display = 'flex';
        }
        document.getElementById('save-token-btn').addEventListener('click', () => {
            const tokenInput = document.getElementById('token-input').value.trim();
            if (tokenInput) {
                localStorage.setItem('bearerToken', tokenInput);
                document.getElementById('token-modal').style.display = 'none';
            } else {
                showMessage('Please enter a valid token!', 'error');
            }
        });

        // Navigation
        const sections = ['emit', 'resonate', 'manage'];
        sections.forEach(section => {
            document.getElementById(\`\${section}-btn\`).addEventListener('click', () => {
                sections.forEach(s => {
                    document.getElementById(\`\${s}-section\`).style.display = 'none';
                    document.getElementById(\`\${s}-btn\`).classList.remove('active');
                });
                document.getElementById(\`\${section}-section\`).style.display = 'block';
                document.getElementById(\`\${section}-btn\`).classList.add('active');
            });
        });
        document.getElementById('emit-btn').click(); // Default to Emit

        // Universe List Management
        function updateUniverseList() {
            const universes = JSON.parse(localStorage.getItem('universes') || '[]');
            const datalist = document.getElementById('universe-list');
            datalist.innerHTML = '';
            universes.forEach(universe => {
                const option = document.createElement('option');
                option.value = universe;
                datalist.appendChild(option);
            });
        }
        updateUniverseList();

        function addUniverse(universe) {
            const universes = JSON.parse(localStorage.getItem('universes') || '[]');
            if (!universes.includes(universe)) {
                universes.push(universe);
                localStorage.setItem('universes', JSON.stringify(universes));
                updateUniverseList();
            }
        }

        // Emit Section
        document.getElementById('add-thing-btn').addEventListener('click', () => {
            const container = document.getElementById('things-container');
            const newThing = container.firstElementChild.cloneNode(true);
            newThing.querySelector('.thing-text').value = '';
            newThing.querySelector('.thing-id').value = '';
            container.appendChild(newThing);
        });

        document.getElementById('emit-submit-btn').addEventListener('click', async () => {
            const universe = document.getElementById('emit-universe').value.trim();
            if (!universe) return showMessage('Enter a universe!', 'error');

            const things = [];
            document.querySelectorAll('.thing-input').forEach(input => {
                const text = input.querySelector('.thing-text').value.trim();
                const id = input.querySelector('.thing-id').value.trim() || undefined;
                if (text) things.push({ text, id });
            });

            if (things.length === 0) return showMessage('Add at least one thing!', 'error');

            try {
                const token = localStorage.getItem('bearerToken');
                const response = await fetch('/emit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`,
                    },
                    body: JSON.stringify({ universe, things }),
                });
                if (response.ok) {
                    showMessage('Things emitted successfully!', 'success');
                    addUniverse(universe);
                } else {
                    const error = await response.json();
                    showMessage(error.error || 'Emission failed!', 'error');
                }
            } catch (err) {
                showMessage('Something went wrong!', 'error');
            }
        });

        // Resonate Section
        document.getElementById('resonate-submit-btn').addEventListener('click', async () => {
            const universe = document.getElementById('resonate-universe').value.trim();
            const thing = document.getElementById('resonate-text').value.trim();
            const reach = parseInt(document.getElementById('resonate-reach').value);

            if (!universe) return showMessage('Enter a universe!', 'error');
            if (!thing) return showMessage('Enter text to resonate with!', 'error');

            try {
                const token = localStorage.getItem('bearerToken');
                const response = await fetch('/resonate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`,
                    },
                    body: JSON.stringify({ universe, thing, reach }),
                });
                if (response.ok) {
                    const data = await response.json();
                    displayResonateResults(data.results);
                    addUniverse(universe);
                } else {
                    const error = await response.json();
                    showMessage(error.error || 'Resonance failed!', 'error');
                }
            } catch (err) {
                showMessage('Something went wrong!', 'error');
            }
        });

        function displayResonateResults(results) {
            const resultsDiv = document.getElementById('resonate-results');
            resultsDiv.innerHTML = '';
            if (results.length === 0) {
                resultsDiv.textContent = 'No matches found.';
                return;
            }
            const table = document.createElement('table');
            table.innerHTML = '<tr><th>Closeness</th><th>Thing</th><th>ID</th></tr>';
            results.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = \`<td>\${result.closeness.toFixed(4)}</td><td>\${result.thing}</td><td>\${result.id}</td>\`;
                table.appendChild(row);
            });
            resultsDiv.appendChild(table);
        }

        // Manage Section
        document.getElementById('delete-thing-btn').addEventListener('click', async () => {
            const universe = document.getElementById('manage-universe').value.trim();
            const id = document.getElementById('delete-id').value.trim();

            if (!universe) return showMessage('Enter a universe!', 'error');
            if (!id) return showMessage('Enter a thing ID!', 'error');

            try {
                const token = localStorage.getItem('bearerToken');
                const response = await fetch(\`/thing/\${universe}/\${id}\`, {
                    method: 'DELETE',
                    headers: { 'Authorization': \`Bearer \${token}\` },
                });
                if (response.ok) {
                    showMessage('Thing deleted!', 'success');
                    addUniverse(universe);
                } else {
                    const error = await response.json();
                    showMessage(error.error || 'Deletion failed!', 'error');
                }
            } catch (err) {
                showMessage('Something went wrong!', 'error');
            }
        });

        document.getElementById('clear-universe-btn').addEventListener('click', async () => {
            const universe = document.getElementById('manage-universe').value.trim();
            if (!universe) return showMessage('Enter a universe!', 'error');
            if (!confirm(\`Clear all things from "\${universe}"? This cannot be undone!\`)) return;

            try {
                const token = localStorage.getItem('bearerToken');
                const response = await fetch(\`/universe/\${universe}\`, {
                    method: 'DELETE',
                    headers: { 'Authorization': \`Bearer \${token}\` },
                });
                if (response.ok) {
                    showMessage('Universe cleared!', 'success');
                    addUniverse(universe);
                } else {
                    const error = await response.json();
                    showMessage(error.error || 'Clearing failed!', 'error');
                }
            } catch (err) {
                showMessage('Something went wrong!', 'error');
            }
        });

        // Utility: Show Message
        function showMessage(message, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.style.background = type === 'error' ? '#e74c3c' : '#2ecc71';
            messageDiv.style.display = 'block';
            setTimeout(() => messageDiv.style.display = 'none', 3000);
        }
    </script>
</body>
</html>`
