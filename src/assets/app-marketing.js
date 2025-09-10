import { auth } from '../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

// Function to render PageSpeed data
function renderPageSpeedData(data) {
  const container = document.getElementById('pagespeed-data');
  if (!container) return;

  // Basic data validation
  if (!data.lighthouseResult || !data.lighthouseResult.categories) {
    container.innerHTML = '<p>No se pudieron obtener los datos de PageSpeed.</p>';
    return;
  }

  const categories = data.lighthouseResult.categories;
  const performance = categories.performance ? Math.round(categories.performance.score * 100) : 'N/A';
  const accessibility = categories.accessibility ? Math.round(categories.accessibility.score * 100) : 'N/A';
  const bestPractices = categories['best-practices'] ? Math.round(categories['best-practices'].score * 100) : 'N/A';
  const seo = categories.seo ? Math.round(categories.seo.score * 100) : 'N/A';

  container.innerHTML = `
    <div class="pagespeed-scores">
      <div class="score-item">
        <span class="score-value">${performance}</span>
        <span class="score-label">Performance</span>
      </div>
      <div class="score-item">
        <span class="score-value">${accessibility}</span>
        <span class="score-label">Accessibility</span>
      </div>
      <div class="score-item">
        <span class="score-value">${bestPractices}</span>
        <span class="score-label">Best Practices</span>
      </div>
      <div class="score-item">
        <span class="score-value">${seo}</span>
        <span class="score-label">SEO</span>
      </div>
    </div>
    <style>
      .pagespeed-scores { display: flex; justify-content: space-around; text-align: center; }
      .score-item { display: flex; flex-direction: column; align-items: center; }
      .score-value { font-size: 2rem; font-weight: bold; }
      .score-label { font-size: 0.9rem; color: #666; }
    </style>
  `;
}


// Google PageSpeed Insights
async function getPageSpeedData(userToken, urlToTest) {
  const container = document.getElementById('pagespeed-data');
  if (!container) return;

  container.innerHTML = '<p>Cargando datos de PageSpeed...</p>';

  try {
    const response = await fetch(`/api/marketing/pagespeed?url=${encodeURIComponent(urlToTest)}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    renderPageSpeedData(data);

  } catch (error) {
    console.error('Error fetching PageSpeed data:', error);
    container.innerHTML = `<p>Error al cargar datos de PageSpeed: ${error.message}</p>`;
  }
}

// --- Google Search Console ---

function renderSearchConsoleData(data) {
  const container = document.getElementById('search-console-data');
  if (!container) return;

  const { totals, queries } = data;

  // Format numbers for display
  const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);
  const formatPercent = (num) => new Intl.NumberFormat('es-MX', { style: 'percent', minimumFractionDigits: 2 }).format(num);
  const formatPosition = (num) => num.toFixed(2);

  let tableRows = queries.map(query => `
    <tr>
      <td>${query.keys[0]}</td>
      <td>${formatNumber(query.clicks)}</td>
      <td>${formatNumber(query.impressions)}</td>
      <td>${formatPercent(query.ctr)}</td>
      <td>${formatPosition(query.position)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="search-console-summary">
      <div class="summary-item">
        <span class="summary-value">${formatNumber(totals.clicks)}</span>
        <span class="summary-label">Total Clicks</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatNumber(totals.impressions)}</span>
        <span class="summary-label">Total Impressions</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatPercent(totals.ctr)}</span>
        <span class="summary-label">Avg. CTR</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatPosition(totals.position)}</span>
        <span class="summary-label">Avg. Position</span>
      </div>
    </div>
    <h6 class="mt-4">Top Queries (Last 30 Days)</h6>
    <table class="table table-striped mt-2">
      <thead>
        <tr>
          <th>Query</th>
          <th>Clicks</th>
          <th>Impressions</th>
          <th>CTR</th>
          <th>Position</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <style>
      .search-console-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center; }
      .summary-item { display: flex; flex-direction: column; }
      .summary-value { font-size: 1.75rem; font-weight: bold; }
      .summary-label { font-size: 0.8rem; color: #666; }
    </style>
  `;
}

async function getSearchConsoleData(userToken) {
  const container = document.getElementById('search-console-data');
  if (!container) return;

  container.innerHTML = '<p>Cargando datos de Search Console...</p>';

  try {
    const response = await fetch('/api/marketing/searchconsole', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    renderSearchConsoleData(data);

  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    container.innerHTML = `<p>Error al cargar datos de Search Console: ${error.message}</p>`;
  }
}

// --- Google Analytics ---

function renderAnalyticsData(data) {
  const container = document.getElementById('analytics-data');
  if (!container) return;

  // The GA4 Data API returns rows and metric headers. We need to map them.
  const metrics = {};
  if (data.rows && data.rows.length > 0) {
    data.metricHeaders.forEach((header, index) => {
      metrics[header.name] = data.rows[0].metricValues[index].value;
    });
  }

  const activeUsers = metrics.activeUsers || '0';
  const sessions = metrics.sessions || '0';
  const pageViews = metrics.screenPageViews || '0';
  const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);


  container.innerHTML = `
    <div class="analytics-summary">
      <div class="summary-item">
        <span class="summary-value">${formatNumber(activeUsers)}</span>
        <span class="summary-label">Users</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatNumber(sessions)}</span>
        <span class="summary-label">Sessions</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatNumber(pageViews)}</span>
        <span class="summary-label">Page Views</span>
      </div>
    </div>
    <p class="text-muted mt-2" style="font-size: 0.8rem; text-align: center;">Last 30 days</p>
    <style>
      .analytics-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; text-align: center; }
    </style>
  `;
}

async function getAnalyticsData(userToken) {
  const container = document.getElementById('analytics-data');
  if (!container) return;

  container.innerHTML = '<p>Cargando datos de Analytics...</p>';

  try {
    const response = await fetch('/api/marketing/analytics', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      // A common issue is the property ID not being set.
      if (errorData.message && errorData.message.includes("YOUR_GA4_PROPERTY_ID")) {
          throw new Error("El ID de Propiedad de Google Analytics 4 no ha sido configurado en el backend.");
      }
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const data = await response.json();
    renderAnalyticsData(data);

  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    container.innerHTML = `<p>Error al cargar datos de Analytics: ${error.message}</p>`;
  }
}

// --- Google Ads (Mock Data) ---

function renderAdsData(data) {
    const container = document.getElementById('ads-data');
    if (!container) return;

    const { clicks, impressions, cost_micros, conversions } = data;

    // Convert cost from micros to a standard currency format
    const cost = (cost_micros / 1000000).toFixed(2);

    const formatNumber = (num) => new Intl.NumberFormat('es-MX').format(num);
    const formatCurrency = (num) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);

    container.innerHTML = `
    <div class="ads-summary">
      <div class="summary-item">
        <span class="summary-value">${formatNumber(clicks)}</span>
        <span class="summary-label">Clicks</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatNumber(impressions)}</span>
        <span class="summary-label">Impressions</span>
      </div>
      <div class="summary-item">
        <span class="summary-value">${formatCurrency(cost)}</span>
        <span class="summary-label">Cost</span>
      </div>
       <div class="summary-item">
        <span class="summary-value">${formatNumber(conversions)}</span>
        <span class="summary-label">Conversions</span>
      </div>
    </div>
    <p class="text-muted mt-2" style="font-size: 0.8rem; text-align: center;">Last 30 days (Mock Data)</p>
    <style>
      .ads-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; text-align: center; }
    </style>
  `;
}

async function getAdsData(userToken) {
    const container = document.getElementById('ads-data');
    if (!container) return;

    container.innerHTML = '<p>Cargando datos de Ads...</p>';

    try {
        const response = await fetch('/api/marketing/ads', {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        renderAdsData(data);

    } catch (error) {
        console.error('Error fetching Google Ads data:', error);
        container.innerHTML = `<p>Error al cargar datos de Ads: ${error.message}</p>`;
    }
}


// Main logic execution
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, get the token and fetch data.
      user.getIdToken().then((token) => {
        // URL to test - let's use the one from the backend for consistency
        const siteUrl = 'https://www.emmanuel-contreras.com/';
        getPageSpeedData(token, siteUrl);
        getSearchConsoleData(token);
        getAnalyticsData(token);
        getAdsData(token);
      });
    } else {
      // User is signed out. The admin-auth.js script should handle the redirect.
      console.log('User is not authenticated.');
    }
  });
});
