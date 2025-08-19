(function(){
  'use strict';
  
  function initModelsChart(){
    try {
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado.');
        return;
      }
      const el = document.getElementById('modelsChart');
      if (!el) return;

      // Si el modo oscuro está activo en root, marcar el canvas para estilos
      if (document.documentElement.classList.contains('iris-dark')) el.classList.add('iris-dark');

      const chartData = {
        labels: [
          'Modelo de Inclusión Comunitaria',
          'Modelo Proactivo y de Aprendizaje',
          'Modelo de Comunicación Accesible',
          'Modelo Lúdico y Educativo',
          'Modelo de Colaboración y Capacitación',
          'Modelo de Eco-Inclusión'
        ],
        datasets: [{
          label: 'Metodologías Clave',
          data: [3, 4, 3, 2, 4, 3],
          backgroundColor: [
            'rgba(74, 124, 89, 0.7)',
            'rgba(111, 158, 123, 0.7)',
            'rgba(147, 191, 158, 0.7)',
            'rgba(184, 224, 192, 0.7)',
            'rgba(74, 124, 89, 0.7)',
            'rgba(111, 158, 123, 0.7)'
          ],
          borderColor: [
            'rgba(74, 124, 89, 1)',
            'rgba(111, 158, 123, 1)',
            'rgba(147, 191, 158, 1)',
            'rgba(184, 224, 192, 1)',
            'rgba(74, 124, 89, 1)',
            'rgba(111, 158, 123, 1)'
          ],
          borderWidth: 1
        }]
      };

      const tooltipsData = [
        ['Enfoque en comunidad', 'Comunicación visual', 'Inclusión de stakeholders'],
        ['Diseño proactivo', 'Datos de usuario', 'Estrategias lúdicas', 'Retroalimentación'],
        ['Comunicación clara', 'Lenguaje no verbal', 'Uso de pictogramas'],
        ['Recursos adaptados', 'Juegos didácticos'],
        ['Entrenamiento de personal', 'Educación inclusiva', 'Co-creación', 'Alianzas estratégicas'],
        ['Educación ambiental', 'Juegos comunitarios', 'Accesibilidad']
      ];

      const ctx = el.getContext('2d');
      // Destruir instancia anterior si existe
      if (el.__chartInstance) {
        try { el.__chartInstance.destroy(); } catch(e){}
      }

      const chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const dataIndex = context.dataIndex;
                  const specificTooltips = tooltipsData[dataIndex] || [];
                  // Devolver array de líneas para tooltip compatible con Chart.js v3+
                  return specificTooltips.map(tip => `• ${tip}`);
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Número de Metodologías Clave Identificadas' }
            },
            y: {
              ticks: { autoSkip: false }
            }
          }
        }
      });

      el.__chartInstance = chart;

    } catch (err) {
      console.error('Error inicializando el gráfico modelsChart:', err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initModelsChart);
  else initModelsChart();

})();
