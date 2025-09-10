import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/client";

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = "http://127.0.0.1:5001/expanded-system-469904-v9/us-central1/api";
    let currentUser = null;

    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (!user) {
            // Deshabilitar todas las funcionalidades si no hay usuario
            document.querySelectorAll('button, input').forEach(el => {
                el.disabled = true;
            });
            document.getElementById('url-input').placeholder = "Inicia sesión para usar las herramientas";
        }
    });

    // --- Lógica de PageSpeed --- 
    const form = document.getElementById('pagespeed-form');
    const urlInput = document.getElementById('url-input');
    const analyzeButton = document.getElementById('analyze-button');
    const resultsContainer = document.getElementById('results-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return alert("Por favor, inicia sesión.");

        const urlToAnalyze = urlInput.value;
        if (!urlToAnalyze) return alert("Por favor, introduce una URL.");

        resultsContainer.innerHTML = `<div class="text-center p-4"><p>Analizando ${urlToAnalyze}...</p></div>`;
        analyzeButton.disabled = true;

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/marketing/pagespeed?url=${encodeURIComponent(urlToAnalyze)}`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (!response.ok) throw new Error((await response.text()) || 'Error en la solicitud');
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            resultsContainer.innerHTML = `<div class="text-center p-4 bg-red-100 text-red-700 rounded-lg"><p><b>Error:</b> ${error.message}</p></div>`;
        } finally {
            analyzeButton.disabled = false;
        }
    });

    function displayResults(data) {
        const { performance, accessibility, 'best-practices': bestPractices, seo } = data.lighthouseResult.categories;
        resultsContainer.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4">Resultados para: <a href="${data.id}" target="_blank" class="text-blue-600 hover:underline">${data.id}</a></h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    ${createScoreCircle('Rendimiento', performance.score * 100)}
                    ${createScoreCircle('Accesibilidad', accessibility.score * 100)}
                    ${createScoreCircle('Buenas Prácticas', bestPractices.score * 100)}
                    ${createScoreCircle('SEO', seo.score * 100)}
                </div>
            </div>
        `;
    }

    function createScoreCircle(label, score) {
        const scoreRounded = Math.round(score);
        let colorClass = 'text-green-500';
        if (scoreRounded < 90) colorClass = 'text-yellow-500';
        if (scoreRounded < 50) colorClass = 'text-red-500';
        return `<div><p class="text-lg font-semibold">${label}</p><p class="text-5xl font-bold ${colorClass}">${scoreRounded}</p></div>`;
    }

    // --- Lógica de Google Search Console ---
    const loadButton = document.getElementById('load-search-console-data');
    const tableBody = document.getElementById('search-console-table-body');

    loadButton.addEventListener('click', async () => {
        if (!currentUser) return alert("Por favor, inicia sesión.");

        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-10">Cargando datos...</td></tr>';
        loadButton.disabled = true;

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/marketing/searchconsole`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los datos de Search Console');
            }

            const data = await response.json();
            displaySearchConsoleData(data);

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-red-600"><b>Error:</b> ${error.message}</td></tr>`;
        } finally {
            loadButton.disabled = false;
        }
    });

    function displaySearchConsoleData(data) {
        // Actualizar KPIs
        document.getElementById('kpi-sc-clicks').textContent = data.totals.clicks.toLocaleString() || '0';
        document.getElementById('kpi-sc-impressions').textContent = data.totals.impressions.toLocaleString() || '0';
        document.getElementById('kpi-sc-ctr').textContent = `${(data.totals.ctr * 100).toFixed(2)}%`;
        document.getElementById('kpi-sc-position').textContent = Math.round(data.totals.position);

        // Llenar tabla
        tableBody.innerHTML = ''; // Limpiar tabla
        if (!data.queries || data.queries.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-10">No se encontraron datos de consultas.</td></tr>';
            return;
        }

        data.queries.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${row.keys[0]}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${row.clicks.toLocaleString()}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${row.impressions.toLocaleString()}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
});
