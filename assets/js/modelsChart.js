(function(){
  'use strict';

  // Inicializa el gráfico de modelos de inspiración
  function initModelsChart(){
    try {
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado. Asegúrate de incluir Chart.js antes de este script.');
        return;
      }

      const el = document.getElementById('modelsChart');
      if (!el) return; // canvas no presente en la página

      const ctx = el.getContext('2d');

      // Datos de ejemplo. Reemplazar por datos reales si están disponibles.
      const labels = ['Modelo A', 'Modelo B', 'Modelo C', 'Modelo D'];
      const dataValues = [3, 4, 2, 5];

      const data = {
        labels: labels,
        datasets: [{
          label: 'Metodologías clave (puntaje)',
          data: dataValues,
          backgroundColor: ['#4A7C59', '#7FB08A', '#9CC4A8', '#CFE7D8'],
          borderColor: 'rgba(0,0,0,0.05)',
          borderWidth: 1
        }]
      };

      const config = {
        type: 'bar',
        data: data,
        options: {
          indexAxis: 'y', // barras horizontales
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'nearest' }
          },
          scales: {
            x: { beginAtZero: true, ticks: { precision: 0 } },
            y: { stacked: false }
          }
        }
      };

      // Crear el chart y guardarlo en el elemento para futuras referencias
      const chartInstance = new Chart(ctx, config);
      el.__chartInstance = chartInstance;

    } catch (err) {
      // No interrumpir la ejecución de otros scripts
      console.error('Error inicializando modelsChart:', err);
    }
  }

  // Esperar a DOMContentLoaded para asegurar que el canvas existe
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModelsChart);
  } else {
    initModelsChart();
  }

})();
