(() => {
  'use strict';

  const VIEW_KEY = 'breitkopf-close-view-v1';
  let mode = localStorage.getItem(VIEW_KEY);
  if (!mode) mode = window.matchMedia('(max-width: 680px)').matches ? 'lista' : 'kanban';

  const responsiveStyles = document.createElement('style');
  responsiveStyles.textContent = `
    .view-switcher{display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid #e3e8ef;border-radius:10px;background:#fff}
    .view-switcher button{border:0;background:transparent;color:#53627a;padding:7px 10px;border-radius:7px;font-size:12px;font-weight:700}
    .view-switcher button[aria-pressed="true"]{background:#10213a;color:#fff}
    #board.list-view{display:block;min-width:0;overflow:visible;padding:0;background:transparent}
    .list-view-wrap{width:100%;overflow-x:auto;border:1px solid #e3e8ef;border-radius:12px;background:#fff;box-shadow:0 8px 25px #182d4c0e}
    .list-table{width:100%;border-collapse:collapse;font-size:12px;min-width:760px}
    .list-table th{text-align:left;padding:11px 12px;background:#f8f9fb;color:#65738a;font-size:10px;text-transform:uppercase;white-space:nowrap}
    .list-table td{padding:11px 12px;border-top:1px solid #eef1f5;vertical-align:top}
    .list-table tr{cursor:pointer}
    .list-table tbody tr:hover td{background:#f5f8fc}
    .list-table tr.list-late td{background:#fff8f7}
    .list-table tr.list-done td{background:#f5faf6}
    .list-table td:nth-child(3){font-weight:700;color:#17253c}
    @media(max-width:980px){.board:not(.list-view){grid-template-columns:repeat(2,minmax(260px,1fr));overflow:visible}}
    @media(max-width:680px){
      .app{padding:14px 12px 28px}
      .top{display:grid;grid-template-columns:1fr;align-items:stretch;gap:12px}
      .brand{min-width:0}.logo{width:min(190px,58vw);height:auto;max-height:58px}
      .top-right{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));justify-content:stretch;gap:8px}
      .monthbox{grid-column:1/-1;width:100%;justify-content:space-between}
      .top-right>.btn{width:100%;min-width:0;padding:8px 7px;font-size:12px}
      .heading{align-items:flex-start;flex-direction:column}.heading h1{font-size:21px}
      .heading-actions{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .heading-actions>.btn{width:100%;min-width:0;padding:8px 6px;font-size:11px}
      .view-switcher{grid-column:1/-1;justify-content:center;width:100%}.view-switcher button{flex:1}
      .kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.kpi{padding:11px;min-height:92px}.kpi-value{font-size:23px}
      .filters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:10px}
      .filters .search,.filters .filter-note,#clearFilters{grid-column:1/-1;width:100%}
      .filters .filter{width:100%;min-width:0;padding:0 7px;font-size:12px}
      .filters .search input{font-size:13px}
      .board:not(.list-view){grid-template-columns:minmax(0,1fr);overflow:visible;margin:0;padding:0}
      .below{grid-template-columns:1fr}
      .footer{flex-direction:column;gap:6px}
      .list-view-wrap{overflow:visible;border:0;background:transparent;box-shadow:none}
      .list-table{min-width:0;border-collapse:separate;border-spacing:0 9px}
      .list-table thead{display:none}
      .list-table,.list-table tbody{display:block;width:100%}
      .list-table tr{display:grid;grid-template-columns:1fr;background:#fff;border:1px solid #e3e8ef;border-radius:10px;overflow:hidden;box-shadow:0 3px 12px #192d480a}
      .list-table td{display:grid;grid-template-columns:104px minmax(0,1fr);gap:8px;padding:8px 10px;border-top:1px solid #eef1f5;overflow-wrap:anywhere}
      .list-table td:before{content:attr(data-label);font-size:10px;font-weight:750;color:#65738a;text-transform:uppercase}
      .list-table tbody tr:first-child td{border-top:0}
      .list-table tr.list-late td{background:#fff8f7}.list-table tr.list-done td{background:#f5faf6}
    }
    @media(max-width:380px){.list-table td{grid-template-columns:88px minmax(0,1fr);font-size:11px}.top-right>.btn{font-size:11px}}
  `;
  document.head.appendChild(responsiveStyles);

  function buildSwitcher() {
    const actions = document.querySelector('.heading-actions');
    if (!actions || document.getElementById('viewSwitcher')) return;
    const wrap = document.createElement('div');
    wrap.id = 'viewSwitcher';
    wrap.className = 'view-switcher';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Alternar visualização do cronograma');
    for (const [value, label] of [['kanban', 'Kanban'], ['lista', 'Lista']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-pressed', String(mode === value));
      button.addEventListener('click', () => {
        if (mode === value) return;
        mode = value;
        localStorage.setItem(VIEW_KEY, mode);
        window.location.reload();
      });
      wrap.appendChild(button);
    }
    actions.appendChild(wrap);
  }

  function textOf(element, selector) {
    return element.querySelector(selector)?.textContent.trim() || '—';
  }

  function renderList(board) {
    if (mode !== 'lista' || !board || !board.querySelector('.column')) return;
    const cards = [...board.querySelectorAll('.task')];
    const labels = ['Status', 'Prazo', 'Tarefa', 'Módulo / área', 'Responsável', 'Empresa / filial', 'Fase'];
    const wrap = document.createElement('div');
    wrap.className = 'list-view-wrap';
    const table = document.createElement('table');
    table.className = 'list-table';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    labels.forEach(label => {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    cards.forEach(card => {
      const tr = document.createElement('tr');
      const status = textOf(card.closest('.column') || card, '.col-title');
      const metadata = [...card.querySelectorAll('.taskmeta .meta')];
      const values = [
        status,
        metadata[0]?.querySelector('strong')?.textContent.trim() || '—',
        textOf(card, 'h3'),
        textOf(card, '.area'),
        textOf(card, '.person'),
        metadata[1]?.textContent.trim() || '—',
        textOf(card, '.badges .tag')
      ];
      values.forEach((value, index) => {
        const td = document.createElement('td');
        td.textContent = value;
        td.setAttribute('data-label', labels[index]);
        tr.appendChild(td);
      });
      if (card.classList.contains('overdue')) tr.classList.add('list-late');
      if (card.classList.contains('completed')) tr.classList.add('list-done');
      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.setAttribute('aria-label', `${values[2]} — ${status}`);
      tr.addEventListener('click', () => card.click());
      tr.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
      tbody.appendChild(tr);
    });
    if (!cards.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = labels.length;
      td.textContent = 'Nenhum cartão para os filtros selecionados.';
      td.className = 'empty';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    board.classList.add('list-view');
    board.replaceChildren(wrap);
  }

  function configureLogo() {
    const logo = document.getElementById('brandLogo');
    const fallback = document.getElementById('brandFallback');
    if (!logo) return;
    const candidates = [
      './LogoBKF.png',
      './Logo%20BKF.png',
      './logo-breitkopf.png',
      'file:///C:/Users/controladoria/Downloads/LogoBKF.png',
      'file:///C:/Users/controladoria/Downloads/Logo%20BKF.png'
    ];
    let next = 0;
    const failed = () => {
      if (next < candidates.length) {
        logo.classList.remove('hidden');
        logo.src = candidates[next++];
        return;
      }
      logo.classList.add('hidden');
      if (fallback) fallback.style.display = 'grid';
    };
    logo.onerror = failed;
    logo.onload = () => {
      logo.classList.remove('hidden');
      if (fallback) fallback.style.display = 'none';
    };
    if (logo.complete && logo.naturalWidth === 0) failed();
    else if (logo.complete && logo.naturalWidth > 0) logo.onload();
  }

  buildSwitcher();
  configureLogo();
  const board = document.getElementById('board');
  if (board) {
    const observer = new MutationObserver(() => renderList(board));
    observer.observe(board, { childList: true });
    renderList(board);
  }
})();
