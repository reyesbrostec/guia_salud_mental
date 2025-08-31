// accessibility.js: control del panel de accesibilidad (display-only, robusto)
(function(){
  function toggle(){
    try {
      const accBtn = document.getElementById('accessibility-btn');
      const accPanel = document.getElementById('accessibility-panel');
      if (!accBtn || !accPanel) return;
      const isHidden = accPanel.style.display === 'none' || getComputedStyle(accPanel).display === 'none';
      if (isHidden) {
        accPanel.classList.remove('hidden');
        accPanel.style.display = 'block';
        accBtn.setAttribute('aria-expanded', 'true');
        const first = accPanel.querySelector('input, button, [tabindex]');
        if (first) first.focus();
      } else {
        accPanel.classList.add('hidden');
        accPanel.style.display = 'none';
        accBtn.setAttribute('aria-expanded', 'false');
      }
    } catch (_) { /* silent */ }
  }
  function applyAccessibility(){
    const val = document.querySelector('input[name="disabilityType"]:checked')?.value || '';
    document.documentElement.setAttribute('data-accessibility', val);
    const accBtnEl = document.getElementById('accessibility-btn');
    if (accBtnEl){
      accBtnEl.style.position = 'fixed';
      accBtnEl.style.zIndex = '99999';
      accBtnEl.style.display = '';
    }
    document.documentElement.classList.remove('acc-visual','acc-auditiva','acc-motriz','acc-cognitiva','acc-dislexia');
    if (val === 'visual') document.documentElement.classList.add('acc-visual');
    if (val === 'auditiva') document.documentElement.classList.add('acc-auditiva');
    if (val === 'motriz') document.documentElement.classList.add('acc-motriz');
    if (val === 'cognitiva') document.documentElement.classList.add('acc-cognitiva');
    if (val === 'dislexia') document.documentElement.classList.add('acc-dislexia');
    const descriptions = {
      visual: 'Aumenta tamaño de fuente y contraste ligero',
      auditiva: 'Activa ayudas auditivas/lectura (no aplica visualmente)',
      motriz: 'Elementos interactivos con mayor área clicable',
      cognitiva: 'Mayor interlineado y ritmo de lectura mejorado',
      dislexia: 'Tipografía y espaciado optimizados para lectura',
    };
    const noteEl = document.getElementById('accessibility-note');
    if (noteEl) noteEl.textContent = 'Modo: ' + (val || 'predeterminado') + (val ? ' — ' + (descriptions[val] || '') : ' — Sin cambios aplicados');
  }
  function init(){
    const accBtn = document.getElementById('accessibility-btn');
    const accPanel = document.getElementById('accessibility-panel');
    if (accBtn && accPanel){
      const initAttr = accPanel.getAttribute('data-init-hidden');
      const initiallyHidden = initAttr !== null ? (initAttr === 'true') : accPanel.classList.contains('hidden');
      if (initiallyHidden){
        accPanel.classList.add('hidden');
        accPanel.style.display = 'none';
        accBtn.setAttribute('aria-expanded', 'false');
      } else {
        accPanel.classList.remove('hidden');
        accPanel.style.display = 'block';
        accBtn.setAttribute('aria-expanded', 'true');
      }
      accBtn.addEventListener('click', toggle);
    }
    document.querySelectorAll('input[name="disabilityType"]').forEach(r => {
      r.addEventListener('change', applyAccessibility);
      r.addEventListener('click', applyAccessibility);
    });
    applyAccessibility();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  // expone toggle global para compatibilidad si existiera markup antiguo
  window.toggleAccessibilityPanel = toggle;
})();
