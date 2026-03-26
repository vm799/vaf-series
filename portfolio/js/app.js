/**
 * VAF Series — Portfolio Application Logic
 * Handles navigation, tabs, data loading, and dynamic rendering.
 */

const App = {

  // ── Utilities ──────────────────────────────────────────

  getBuild(id) {
    return CONFIG.builds.find(b => b.id === id);
  },

  getBuildContent(id) {
    return BUILDS[id];
  },

  getStatusClass(status) {
    return `status-${status}`;
  },

  getStatusLabel(status) {
    const labels = {
      live: 'Live',
      running: 'Running',
      queued: 'Queued',
      hidden: 'Hidden',
    };
    return labels[status] || status;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // ── Home Page ──────────────────────────────────────────

  renderHome() {
    this.renderHomeStats();
    this.renderTimeline();
    this.renderArchOverview();
  },

  renderHomeStats() {
    const el = document.getElementById('stats-bar');
    if (!el) return;

    const builds = CONFIG.builds;
    const live = builds.filter(b => b.status === 'live').length;
    const running = builds.filter(b => b.status === 'running').length;
    const total = builds.length;
    const pct = Math.round((live / total) * 100);

    el.innerHTML = `
      <div class="stat-item animate-in">
        <div class="stat-value">${live}</div>
        <div class="stat-label">Modules Live</div>
      </div>
      <div class="stat-item animate-in">
        <div class="stat-value">${running}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-item animate-in">
        <div class="stat-value">${pct}%</div>
        <div class="stat-label">Complete</div>
      </div>
      <div class="stat-item animate-in">
        <div class="stat-value">Day ${CONFIG.currentDay}</div>
        <div class="stat-label">of 5</div>
      </div>
    `;
  },

  renderTimeline() {
    const el = document.getElementById('timeline-days');
    if (!el) return;

    el.innerHTML = CONFIG.days.map(day => {
      const dayBuilds = CONFIG.builds.filter(b => b.day === day.num);
      const isActive = day.num === CONFIG.currentDay;
      const isPast = day.num < CONFIG.currentDay;

      return `
        <div class="timeline-day ${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''} animate-in">
          <div class="timeline-day-header">
            <span class="timeline-day-label">${day.label}</span>
            <span class="timeline-day-name">${day.name}</span>
          </div>
          <div class="timeline-day-builds">
            ${dayBuilds.map(b => this.renderBuildCard(b)).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  renderBuildCard(build) {
    const featured = build.featured ? 'is-featured' : '';
    const clickable = build.status !== 'hidden';

    return `
      <a href="build.html?id=${build.id}"
         class="build-card ${this.getStatusClass(build.status)} ${featured}"
         ${!clickable ? 'style="pointer-events:none"' : ''}>
        <div class="build-card-icon" style="color: ${build.accent}">
          ${build.icon}
        </div>
        <div class="build-card-content">
          <div class="build-card-number">Build ${build.id}</div>
          <div class="build-card-name">${build.name}</div>
        </div>
        <span class="build-card-status ${build.status}">
          ${this.getStatusLabel(build.status)}
        </span>
        ${build.featured ? '<span class="badge-featured">Flagship</span>' : ''}
      </a>
    `;
  },

  renderArchOverview() {
    const el = document.getElementById('arch-pipeline');
    if (!el) return;

    const nodes = CONFIG.builds.map(b => ({
      label: `${b.id} ${b.shortName}`,
      color: b.accent,
      status: b.status,
    }));

    el.innerHTML = nodes.map((node, i) => {
      const opacity = node.status === 'queued' ? '0.4' : '1';
      return `
        ${i > 0 ? '<span class="arch-arrow">→</span>' : ''}
        <span class="arch-node" style="border-color: ${node.color}; opacity: ${opacity}; color: ${node.color}">
          ${node.label}
        </span>
      `;
    }).join('');
  },


  // ── Build Detail Page ──────────────────────────────────

  renderBuildPage() {
    const params = new URLSearchParams(window.location.search);
    const buildId = params.get('id');

    if (!buildId) {
      window.location.href = 'index.html';
      return;
    }

    const buildConfig = this.getBuild(buildId);
    const buildContent = this.getBuildContent(buildId);

    if (!buildConfig || !buildContent) {
      document.getElementById('build-content').innerHTML =
        '<p class="text-muted">Build not found.</p>';
      return;
    }

    this.renderSidebar(buildId);
    this.renderBuildHero(buildConfig, buildContent);
    this.renderTabs(buildConfig, buildContent);
  },

  renderSidebar(activeBuildId) {
    const el = document.getElementById('sidebar-nav');
    if (!el) return;

    el.innerHTML = CONFIG.builds.map(b => `
      <a href="build.html?id=${b.id}"
         class="sidebar-nav-item ${b.id === activeBuildId ? 'active' : ''}">
        <span class="dot ${b.status}"></span>
        <span class="num">${b.id}</span>
        <span>${b.shortName}</span>
      </a>
    `).join('');
  },

  renderBuildHero(config, content) {
    const el = document.getElementById('build-hero');
    if (!el) return;

    el.innerHTML = `
      <div class="build-hero-number" style="color: ${config.accent}">
        Build ${config.id} — ${this.getStatusLabel(config.status)}
      </div>
      <h1>${content.hero.title}</h1>
      <p class="build-hero-oneliner">${content.hero.oneLiner}</p>
      <div class="build-tags">
        ${config.tags.map(t => `<span class="build-tag">${t}</span>`).join('')}
      </div>
    `;
  },

  renderTabs(config, content) {
    const tabsEl = document.getElementById('build-tabs');
    const panelsEl = document.getElementById('build-panels');
    if (!tabsEl || !panelsEl) return;

    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'architecture', label: 'Architecture' },
      { id: 'decisions', label: 'Decisions' },
      { id: 'code', label: 'Implementation' },
      { id: 'results', label: 'Results' },
    ];

    // Only show code tab if there are code examples
    const filteredTabs = tabs.filter(t => {
      if (t.id === 'code' && (!content.code || content.code.length === 0)) return false;
      return true;
    });

    tabsEl.innerHTML = filteredTabs.map((t, i) => `
      <button class="tab ${i === 0 ? 'active' : ''}"
              data-tab="${t.id}"
              onclick="App.switchTab('${t.id}')">${t.label}</button>
    `).join('');

    panelsEl.innerHTML = filteredTabs.map((t, i) => `
      <div id="panel-${t.id}" class="tab-panel ${i === 0 ? 'active' : ''}">
        ${this.renderTabContent(t.id, config, content)}
      </div>
    `).join('');
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    document.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById(`panel-${tabId}`)?.classList.add('active');
  },

  renderTabContent(tabId, config, content) {
    switch (tabId) {
      case 'overview':    return this.renderOverviewTab(content);
      case 'architecture': return this.renderArchTab(content);
      case 'decisions':   return this.renderDecisionsTab(content);
      case 'code':        return this.renderCodeTab(content);
      case 'results':     return this.renderResultsTab(config, content);
      default:            return '<p class="text-muted">Coming soon.</p>';
    }
  },


  // ── Tab Renderers ──────────────────────────────────────

  renderOverviewTab(content) {
    const o = content.overview;
    const h = content.hero;

    return `
      <div class="content-block">
        <h3>The Problem</h3>
        <p>${h.problem}</p>
        <div class="pain-point">
          <p>${h.painPoint}</p>
        </div>
      </div>

      <div class="content-block">
        <h3>The Solution</h3>
        ${o.paragraphs.map(p => `<p>${p}</p>`).join('')}
      </div>

      <div class="key-metrics">
        ${o.keyMetrics.map(m => `
          <div class="key-metric">
            <div class="key-metric-value">${m.value}</div>
            <div class="key-metric-label">${m.label}</div>
            <div class="key-metric-detail">${m.detail}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderArchTab(content) {
    const a = content.architecture;

    return `
      <div class="content-block">
        <h3>Architecture Overview</h3>
        <p>${a.description}</p>
      </div>

      <div class="content-block">
        <h3>System Layers</h3>
        <div class="arch-layers">
          ${a.layers.map(layer => `
            <div class="arch-layer" style="border-left-color: ${layer.color}">
              <div>
                <div class="arch-layer-name" style="color: ${layer.color}">${layer.name}</div>
                <div class="arch-layer-desc">${layer.description}</div>
              </div>
              <div class="arch-layer-components">
                ${layer.components.map(c => `
                  <span class="arch-layer-component">${c}</span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${a.flow ? `
        <div class="content-block">
          <h3>Data Flow</h3>
          <div class="data-flow">
            ${a.flow.map(step => `
              <div class="data-flow-step">${step}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },

  renderDecisionsTab(content) {
    const d = content.decisions;
    if (!d || d.length === 0) {
      return '<p class="text-muted">Design decisions will be documented as this build progresses.</p>';
    }

    return `
      <div class="content-block">
        <h3>Design Decisions & Trade-offs</h3>
        <p>Every engineering decision involves trade-offs. Here's what was chosen, why, and what the alternative was.</p>
      </div>

      <div class="decisions-list">
        ${d.map(dec => `
          <div class="decision-card">
            <div class="decision-header">
              <span class="decision-question">${dec.decision}</span>
            </div>
            <div class="decision-body">
              <div class="decision-chosen">
                <div class="decision-chosen-label">Chosen</div>
                <div class="decision-chosen-value">${dec.choice}</div>
                <div class="decision-reasoning">${dec.reasoning}</div>
              </div>
              <div class="decision-alt">
                <div class="decision-alt-label">Alternative considered</div>
                <div class="decision-reasoning">${dec.alternative}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderCodeTab(content) {
    const c = content.code;
    if (!c || c.length === 0) {
      return '<p class="text-muted">Code examples will be added when this build is implemented.</p>';
    }

    return `
      <div class="content-block">
        <h3>Key Implementation Details</h3>
        <p>Selected code examples showing the core engineering decisions in action.</p>
      </div>

      <div class="code-examples">
        ${c.map(block => `
          <div class="code-block">
            <div class="code-block-header">
              <span class="code-block-title">${block.title}</span>
              <span class="code-block-lang">${block.language}</span>
            </div>
            <pre>${this.escapeHtml(block.code)}</pre>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderResultsTab(config, content) {
    const rc = content.resultsConfig;

    if (config.status === 'queued' || config.status === 'hidden') {
      return `
        <div class="results-empty">
          <div class="results-empty-icon">◇</div>
          <p class="results-empty-text">${rc.emptyMessage}</p>
        </div>
      `;
    }

    if (config.status === 'running') {
      return `
        <div class="results-empty">
          <div class="results-empty-icon" style="animation: pulse 2s infinite">◈</div>
          <p class="results-empty-text">
            Build is currently in progress. Results will appear here when complete.
          </p>
        </div>
      `;
    }

    // Status is "live" — try to load data
    if (!config.dataFile) {
      return `
        <div class="results-empty">
          <div class="results-empty-icon">◇</div>
          <p class="results-empty-text">
            Build is live but no data file is configured yet.
            Update config.js with the dataFile path.
          </p>
        </div>
      `;
    }

    // Create a container that will be populated by async data load
    const containerId = `results-${config.id}`;
    setTimeout(() => this.loadResultsData(config, rc, containerId), 100);

    return `
      <div id="${containerId}">
        <div class="results-empty">
          <div class="results-empty-icon" style="animation: pulse 2s infinite">◈</div>
          <p class="results-empty-text">Loading results...</p>
        </div>
      </div>
    `;
  },

  async loadResultsData(config, resultsConfig, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const resp = await fetch(config.dataFile + '?t=' + Date.now());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const sourceFilterMap = {
        rss_count: 'rss',
        pdf_count: 'pdf',
        web_count: 'web',
        email_count: 'email',
      };

      const metricsHtml = (resultsConfig.metrics || []).map(m => {
        let value = data[m.key];
        if (value === undefined) value = '—';
        const filter = sourceFilterMap[m.key];
        const hasFilter = filter && data.documents?.some(d => d.source_type === filter);
        return `
          <div class="results-metric ${hasFilter ? 'results-metric--clickable' : ''}"
               ${hasFilter ? `data-filter="${filter}" onclick="App.filterDocuments('${containerId}', '${filter}')"` : ''}>
            <div class="results-metric-value">${value}${m.suffix || ''}</div>
            <div class="results-metric-label">${m.label}</div>
            ${hasFilter ? '<div class="results-metric-hint">click to drill down</div>' : ''}
          </div>
        `;
      }).join('');

      const docsHtml = this._renderDocTable(data.documents || [], null);

      container.innerHTML = `
        <div class="results-live">
          <div class="results-live-header">
            <span class="nav-status-dot"></span>
            Live Results — Generated ${data.generated_at || 'N/A'}
          </div>
          <div class="results-metrics">${metricsHtml}</div>
        </div>
        <div class="results-doc-section" id="${containerId}-docs">
          <div class="results-doc-header">
            <span id="${containerId}-filter-label">All Documents</span>
            <button class="results-doc-clear" id="${containerId}-clear" style="display:none"
              onclick="App.filterDocuments('${containerId}', null)">
              ✕ Clear filter
            </button>
          </div>
          ${docsHtml}
        </div>
      `;

      // store data on container for filtering
      container._data = data;
    } catch (err) {
      container.innerHTML = `
        <div class="results-empty">
          <div class="results-empty-icon">◇</div>
          <p class="results-empty-text">
            Results data not available yet. Run the build to generate output,
            then results will appear here automatically.
          </p>
          <p class="results-empty-text text-muted" style="margin-top: 0.5rem; font-size: 0.75rem;">
            Expected at: ${config.dataFile}
          </p>
        </div>
      `;
    }
  },

  filterDocuments(containerId, filter) {
    const container = document.getElementById(containerId);
    if (!container?._data) return;
    const docs = container._data.documents || [];
    const filtered = filter ? docs.filter(d => d.source_type === filter) : docs;
    const tableEl = container.querySelector('.results-doc-table-wrap');
    if (tableEl) tableEl.outerHTML = this._renderDocTable(filtered, filter);
    const label = document.getElementById(`${containerId}-filter-label`);
    const clearBtn = document.getElementById(`${containerId}-clear`);
    if (label) label.textContent = filter ? `${filter.toUpperCase()} documents (${filtered.length})` : `All Documents`;
    if (clearBtn) clearBtn.style.display = filter ? 'inline-block' : 'none';
    // toggle active state on metrics
    container.querySelectorAll('.results-metric--clickable').forEach(el => {
      el.classList.toggle('results-metric--active', el.dataset.filter === filter);
    });
  },

  _renderDocTable(docs, filter) {
    if (!docs.length) return `<p class="results-empty-text" style="padding:var(--space-lg)">No documents match this filter.</p>`;
    const sourceIcon = { rss: '◈', pdf: '▣', web: '◉', email: '✉' };
    const rows = docs.slice(0, 50).map(doc => `
      <tr>
        <td><span class="doc-source-badge doc-source-${doc.source_type}">${sourceIcon[doc.source_type] || '·'} ${doc.source_type}</span></td>
        <td class="doc-title">${doc.title || '—'}</td>
        <td class="doc-summary">${doc.summary ? doc.summary.slice(0, 120) + (doc.summary.length > 120 ? '…' : '') : '—'}</td>
        <td class="doc-time">${doc.ingested_at ? doc.ingested_at.slice(0, 16).replace('T', ' ') : '—'}</td>
      </tr>
    `).join('');
    const overflow = docs.length > 50 ? `<p class="results-overflow">Showing 50 of ${docs.length} documents</p>` : '';
    return `
      <div class="results-doc-table-wrap">
        <table class="results-doc-table">
          <thead><tr><th>Source</th><th>Title</th><th>Summary</th><th>Ingested</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${overflow}
      </div>
    `;
  },


  // ── Navigation Helper ──────────────────────────────────

  renderNavStatus() {
    const el = document.getElementById('nav-status');
    if (!el) return;

    const live = CONFIG.builds.filter(b => b.status === 'live').length;
    el.innerHTML = `
      <span class="nav-status-dot"></span>
      <span>${live}/${CONFIG.builds.length} live</span>
    `;
  },

  // ── Init ───────────────────────────────────────────────

  init(page) {
    this.renderNavStatus();

    if (page === 'home') {
      this.renderHome();
    } else if (page === 'build') {
      this.renderBuildPage();
    }
  },
};
