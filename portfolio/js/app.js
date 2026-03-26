/**
 * VAF Series — Portfolio Application Logic
 * Handles navigation, tabs, data loading, and dynamic rendering.
 */

var App = {

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

    if (config.status === 'hidden') {
      return `<div class="results-empty"><div class="results-empty-icon">◇</div><p class="results-empty-text">${rc.emptyMessage}</p></div>`;
    }

    // Always try to load data if a dataFile is configured — show preview for queued/running builds too
    if (!config.dataFile) {
      const msg = config.status === 'queued'
        ? (rc.emptyMessage || 'Coming soon.')
        : 'Build is running — results will appear here when complete.';
      const icon = config.status === 'running' ? '◈' : '◇';
      const anim = config.status === 'running' ? ' style="animation: pulse 2s infinite"' : '';
      return `<div class="results-empty"><div class="results-empty-icon"${anim}>${icon}</div><p class="results-empty-text">${msg}</p></div>`;
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

      container._data = data;

      if (resultsConfig.type === 'sanitisation') {
        container.innerHTML = this._renderSanitisationResults(data, containerId);
      } else if (resultsConfig.type === 'identity') {
        container.innerHTML = this._renderIdentityResults(data, resultsConfig);
      } else if (resultsConfig.type === 'rag') {
        container.innerHTML = this._renderRagResults(data, resultsConfig);
      } else if (resultsConfig.type === 'self-evolving') {
        container.innerHTML = this._renderSelfEvolvingResults(data, resultsConfig);
      } else if (resultsConfig.type === 'council') {
        container.innerHTML = this._renderCouncilResults(data, resultsConfig);
      } else if (resultsConfig.type === 'compliance') {
        container.innerHTML = this._renderComplianceResults(data, resultsConfig);
      } else if (resultsConfig.type === 'synthesis') {
        container.innerHTML = this._renderSynthesisResults(data, resultsConfig);
      } else if (resultsConfig.type === 'output') {
        container.innerHTML = this._renderOutputResults(data, resultsConfig);
      } else {
        container.innerHTML = this._renderIngestionResults(data, resultsConfig, containerId);
      }
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

  _renderIngestionResults(data, resultsConfig, containerId) {
    const sourceFilterMap = { rss_count: 'rss', pdf_count: 'pdf', web_count: 'web', email_count: 'email' };
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
          ${hasFilter ? '<div class="results-metric-hint">click to filter</div>' : ''}
        </div>
      `;
    }).join('');
    return `
      <div class="results-live">
        <div class="results-live-header">
          <span class="nav-status-dot"></span>
          Live Results — Generated ${data.generated_at ? data.generated_at.slice(0,16).replace('T',' ') : 'N/A'}
        </div>
        <div class="results-metrics">${metricsHtml}</div>
      </div>
      <div class="results-doc-section" id="${containerId}-docs">
        <div class="results-doc-header">
          <span id="${containerId}-filter-label">All Documents</span>
          <button class="results-doc-clear" id="${containerId}-clear" style="display:none"
            onclick="App.filterDocuments('${containerId}', null)">✕ Clear filter</button>
        </div>
        ${this._renderDocTable(data.documents || [], null)}
      </div>
    `;
  },

  _renderSanitisationResults(data, containerId) {
    const docs = data.documents || [];
    const blocked = docs.filter(d => d.status === 'BLOCKED');
    const redacted = docs.filter(d => d.status === 'REDACTED');
    const passed  = docs.filter(d => d.status === 'PASSED');

    // Aggregate PII types across all docs
    const piiTypes = {};
    docs.forEach(doc => {
      (doc.actions || []).forEach(a => {
        const m = a.match(/^pii_redacted:([^:]+):(\d+)$/);
        if (m) piiTypes[m[1]] = (piiTypes[m[1]] || 0) + parseInt(m[2]);
      });
    });

    const totalInjections = docs.reduce((s, d) => s + (d.injection_attempts || 0), 0);
    const totalPii        = docs.reduce((s, d) => s + (d.pii_removed || 0), 0);

    const verdictMetrics = [
      { key: 'input_count',  label: 'Documents Processed', value: data.input_count,  filter: null,      cls: '' },
      { key: 'passed',       label: 'Passed Clean',         value: passed.length,     filter: 'PASSED',  cls: 'metric--pass' },
      { key: 'blocked',      label: 'Threats Blocked',      value: blocked.length,    filter: 'BLOCKED', cls: 'metric--block' },
      { key: 'redacted',     label: 'PII Redacted',         value: redacted.length,   filter: 'REDACTED',cls: 'metric--redact' },
    ];

    const metricsHtml = verdictMetrics.map(m => `
      <div class="results-metric ${m.filter ? 'results-metric--clickable' : ''} ${m.cls}"
           ${m.filter ? `data-filter="${m.filter}" onclick="App.filterSanitisation('${containerId}', '${m.filter}')"` : ''}>
        <div class="results-metric-value">${m.value}</div>
        <div class="results-metric-label">${m.label}</div>
        ${m.filter ? '<div class="results-metric-hint">click to drill down</div>' : ''}
      </div>
    `).join('');

    // Security audit panels
    const threatPanel = totalInjections > 0 ? `
      <div class="sec-panel sec-panel--blocked">
        <div class="sec-panel-title">🚨 Injection Attempts Neutralised (${totalInjections})</div>
        ${blocked.map(doc => `
          <div class="sec-panel-row">
            <span class="sec-verdict sec-verdict--blocked">BLOCKED</span>
            <span class="sec-doc-title">${doc.title}</span>
            <span class="sec-actions">${(doc.actions||[]).filter(a=>a.startsWith('injection')).join(', ') || 'injection_neutralised'} ×${doc.injection_attempts}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const piiPanel = totalPii > 0 ? `
      <div class="sec-panel sec-panel--redacted">
        <div class="sec-panel-title">🔒 PII Redacted — ${totalPii} items across ${redacted.length} document${redacted.length !== 1 ? 's' : ''}</div>
        <div class="sec-pii-types">
          ${Object.entries(piiTypes).map(([type, count]) => `
            <span class="sec-pii-badge">${type.replace('_', ' ')} ×${count}</span>
          `).join('')}
        </div>
        ${redacted.map(doc => `
          <div class="sec-panel-row">
            <span class="sec-verdict sec-verdict--redacted">REDACTED</span>
            <span class="sec-doc-title">${doc.title}</span>
            <span class="sec-actions">${doc.pii_removed} item${doc.pii_removed !== 1 ? 's' : ''} removed</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="results-live">
        <div class="results-live-header">
          <span class="nav-status-dot"></span>
          Security Audit — Run ${data.generated_at ? data.generated_at.slice(0,16).replace('T',' ') : 'N/A'}
          <span class="results-pii-mode">PII Mode: ${(data.pii_mode || 'redact').toUpperCase()}</span>
        </div>
        <div class="results-metrics">${metricsHtml}</div>
      </div>

      ${threatPanel}
      ${piiPanel}

      <div class="results-doc-section" id="${containerId}-docs">
        <div class="results-doc-header">
          <span id="${containerId}-filter-label">All Documents</span>
          <button class="results-doc-clear" id="${containerId}-clear" style="display:none"
            onclick="App.filterSanitisation('${containerId}', null)">✕ Clear filter</button>
        </div>
        ${this._renderSanitisationTable(docs, null)}
      </div>
    `;
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
    if (label) label.textContent = filter ? `${filter.toUpperCase()} — ${filtered.length} docs` : 'All Documents';
    if (clearBtn) clearBtn.style.display = filter ? 'inline-block' : 'none';
    container.querySelectorAll('.results-metric--clickable').forEach(el => {
      el.classList.toggle('results-metric--active', el.dataset.filter === filter);
    });
  },

  filterSanitisation(containerId, filter) {
    const container = document.getElementById(containerId);
    if (!container?._data) return;
    const docs = container._data.documents || [];
    const filtered = filter ? docs.filter(d => d.status === filter) : docs;
    const tableEl = container.querySelector('.results-doc-table-wrap');
    if (tableEl) tableEl.outerHTML = this._renderSanitisationTable(filtered, filter);
    const label = document.getElementById(`${containerId}-filter-label`);
    const clearBtn = document.getElementById(`${containerId}-clear`);
    if (label) label.textContent = filter ? `${filter} — ${filtered.length} docs` : 'All Documents';
    if (clearBtn) clearBtn.style.display = filter ? 'inline-block' : 'none';
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

  _renderSanitisationTable(docs, filter) {
    if (!docs.length) return `<p class="results-empty-text" style="padding:var(--space-lg)">No documents match this filter.</p>`;
    const sourceIcon = { rss: '◈', pdf: '▣', web: '◉', email: '✉' };
    const verdictClass = { PASSED: 'verdict--pass', BLOCKED: 'verdict--block', REDACTED: 'verdict--redact' };
    const rows = docs.slice(0, 50).map(doc => `
      <tr>
        <td><span class="doc-source-badge doc-source-${doc.source_type}">${sourceIcon[doc.source_type] || '·'} ${doc.source_type}</span></td>
        <td class="doc-title">${doc.title || '—'}</td>
        <td><span class="sec-verdict ${verdictClass[doc.status] || ''}">${doc.status}</span></td>
        <td class="doc-summary">${
          doc.status === 'BLOCKED'  ? `⚠ ${doc.injection_attempts} injection pattern${doc.injection_attempts !== 1 ? 's' : ''} detected` :
          doc.status === 'REDACTED' ? `🔒 ${doc.pii_removed} PII item${doc.pii_removed !== 1 ? 's' : ''} removed` :
          '✓ No threats found'
        }</td>
        <td class="doc-time">${doc.sanitised_at ? doc.sanitised_at.slice(0,16).replace('T',' ') : '—'}</td>
      </tr>
    `).join('');
    const overflow = docs.length > 50 ? `<p class="results-overflow">Showing 50 of ${docs.length} documents</p>` : '';
    return `
      <div class="results-doc-table-wrap">
        <table class="results-doc-table">
          <thead><tr><th>Source</th><th>Title</th><th>Verdict</th><th>Detail</th><th>Time</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${overflow}
      </div>
    `;
  },


  _renderIdentityResults(data, resultsConfig) {
    const metricsHtml = (resultsConfig.metrics || []).map(m => {
      const value = data[m.key] !== undefined ? data[m.key] : '—';
      return `
        <div class="results-metric">
          <div class="results-metric-value">${value}</div>
          <div class="results-metric-label">${m.label}</div>
        </div>`;
    }).join('');

    const comparisonsHtml = (data.comparisons || []).map((c, i) => `
      <div class="identity-comparison">
        <div class="identity-prompt">Prompt ${i + 1}: ${c.prompt}</div>
        <div class="identity-pair">
          <div class="identity-col identity-col--generic">
            <div class="identity-col-label">
              ✗ Generic AI
              ${c.generic_violations?.length ? `<span class="identity-violation-badge">${c.generic_violations.length} violation${c.generic_violations.length !== 1 ? 's' : ''}</span>` : ''}
            </div>
            <div class="identity-col-text">${c.generic_response}</div>
          </div>
          <div class="identity-col identity-col--branded">
            <div class="identity-col-label">
              ✓ Firm-Branded
              ${c.branded_disclaimer_present ? '<span class="identity-disclaimer-badge">FCA disclaimer ✓</span>' : ''}
            </div>
            <div class="identity-col-text">${c.branded_response}</div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="results-live">
        <div class="results-live-header">
          <span class="nav-status-dot"></span>
          Identity Audit — Run ${data.generated_at ? data.generated_at.slice(0,16).replace('T',' ') : 'N/A'}
          <span class="results-pii-mode">Model: ${data.model || 'claude'}</span>
        </div>
        <div class="results-metrics">${metricsHtml}</div>
      </div>
      <div class="identity-comparisons">${comparisonsHtml}</div>
    `;
  },

  // ── Generic metric helper ──────────────────────────────

  _metricValue(data, m) {
    let v = data[m.key];
    if (v === undefined) return '—';
    if (m.transform === 'length') return Array.isArray(v) ? v.length : '—';
    if (m.transform === 'nav') return typeof v === 'number' ? `£${(v / 1e6).toFixed(0)}m` : v;
    if (m.transform === 'dryrun') return v ? 'Dry Run' : 'Live';
    return v;
  },

  _metricsRow(data, resultsConfig) {
    return (resultsConfig.metrics || []).map(m => {
      const val = this._metricValue(data, m);
      const variant = m.variant ? ` metric--${m.variant}` : '';
      return `
        <div class="results-metric${variant}">
          <div class="results-metric-value">${val}${m.suffix || ''}</div>
          <div class="results-metric-label">${m.label}</div>
        </div>`;
    }).join('');
  },

  _liveHeader(data, title) {
    const ts = data.generated_at ? data.generated_at.slice(0,16).replace('T',' ') : 'N/A';
    return `<div class="results-live-header"><span class="nav-status-dot"></span>${title} — Run ${ts}</div>`;
  },

  // ── RAG Results ────────────────────────────────────────

  _renderRagResults(data, resultsConfig) {
    const queriesHtml = (data.queries || []).map(q => {
      const icon = q.confidence === 'high' ? '✓' : q.confidence === 'not_found' ? '◇' : '?';
      const cls = q.confidence === 'high' ? 'rag-answer--found' : 'rag-answer--empty';
      const sourcesHtml = (q.sources || []).map(s => `<span class="sec-pii-badge">${s}</span>`).join('');
      return `
        <div class="rag-answer ${cls}">
          <div class="rag-question">❓ ${q.question}</div>
          <div class="rag-response">${icon} ${q.answer}</div>
          ${sourcesHtml ? `<div class="rag-sources">${sourcesHtml}</div>` : ''}
        </div>`;
    }).join('');

    return `
      <div class="results-live">
        ${this._liveHeader(data, 'RAG Query Results')}
        <div class="results-metrics">${this._metricsRow(data, resultsConfig)}</div>
      </div>
      <div class="rag-queries">${queriesHtml}</div>`;
  },

  // ── Self-Evolving Results ──────────────────────────────

  _renderSelfEvolvingResults(data, resultsConfig) {
    const changesHtml = (data.changes_made || []).map(c => `<li>${c}</li>`).join('');
    return `
      <div class="results-live">
        ${this._liveHeader(data, 'Prompt Evolution')}
        <div class="results-metrics">${this._metricsRow(data, resultsConfig)}</div>
      </div>
      <div class="evolve-panels">
        <div class="evolve-panel evolve-panel--before">
          <div class="evolve-label">V1 — Initial Prompt</div>
          <pre class="evolve-prompt">${data.v1_prompt || ''}</pre>
          <div class="evolve-sample-label">Sample output:</div>
          <div class="evolve-sample">${data.v1_sample || ''}</div>
        </div>
        <div class="evolve-arrow">→</div>
        <div class="evolve-panel evolve-panel--after">
          <div class="evolve-label">V2 — Meta-Agent Improved</div>
          <pre class="evolve-prompt">${data.v2_prompt || ''}</pre>
          <div class="evolve-sample-label">Sample output:</div>
          <div class="evolve-sample">${data.v2_sample || ''}</div>
        </div>
      </div>
      ${changesHtml ? `<div class="evolve-changes"><strong>Changes made:</strong><ul>${changesHtml}</ul></div>` : ''}
      ${data.rationale ? `<div class="evolve-rationale"><strong>Rationale:</strong> ${data.rationale}</div>` : ''}`;
  },

  // ── Council Results ────────────────────────────────────

  _renderCouncilResults(data, resultsConfig) {
    const verdictClass = { BUY: 'verdict--pass', SELL: 'verdict--block', HOLD: 'verdict--redact' };
    const agentsHtml = (data.agents || []).map(a => {
      const pointsHtml = (a.key_points || []).map(p => `<li>${p}</li>`).join('');
      return `
        <div class="council-agent">
          <div class="council-agent-header">
            <span class="council-agent-name">${a.name}</span>
            <span class="sec-verdict ${verdictClass[a.verdict] || ''}">${a.verdict}</span>
            <span class="council-confidence">confidence: ${a.confidence}</span>
          </div>
          <ul class="council-points">${pointsHtml}</ul>
          <p class="council-summary">${a.summary}</p>
        </div>`;
    }).join('');

    return `
      <div class="results-live">
        ${this._liveHeader(data, `Council — ${data.company || ''}`)}
        <div class="results-metrics">${this._metricsRow(data, resultsConfig)}</div>
      </div>
      <div class="council-agents">${agentsHtml}</div>`;
  },

  // ── Compliance Results ─────────────────────────────────

  _renderComplianceResults(data, resultsConfig) {
    const sev = { CRITICAL: 'verdict--block', HIGH: 'verdict--block', MEDIUM: 'verdict--redact', LOW: '' };
    const violationsHtml = (data.violations || []).map(v => `
      <div class="sec-panel sec-panel--blocked">
        <div class="sec-panel-row">
          <span class="sec-verdict ${sev[v.severity] || ''}">${v.severity}</span>
          <strong>${v.rule_id}</strong>
          <span>${v.description}</span>
        </div>
        <div class="sec-panel-row" style="font-style:italic;opacity:0.7;">"${v.violating_text}"</div>
        <div class="sec-panel-row" style="color:var(--color-pass);">Fix: ${v.suggested_fix}</div>
      </div>`).join('');

    const rewriteHtml = data.compliant_rewrite ? `
      <div class="sec-panel sec-panel--redacted" style="margin-top:var(--space-lg);">
        <div class="sec-panel-row"><strong>Compliant Rewrite</strong></div>
        <pre style="white-space:pre-wrap;opacity:0.85;font-size:0.8rem;">${data.compliant_rewrite}</pre>
      </div>` : '';

    return `
      <div class="results-live">
        ${this._liveHeader(data, 'Compliance Audit')}
        <div class="results-metrics">${this._metricsRow(data, resultsConfig)}</div>
      </div>
      ${violationsHtml}
      ${rewriteHtml}`;
  },

  // ── Synthesis Results ──────────────────────────────────

  _renderSynthesisResults(data, resultsConfig) {
    const positionsHtml = (data.positions || []).map(p => {
      const pnl = p.overnight_pnl_pct;
      const sign = pnl >= 0 ? '+' : '';
      const cls = pnl >= 0 ? 'style="color:var(--color-pass)"' : 'style="color:var(--color-block)"';
      return `<tr><td>${p.name}</td><td>${p.weight_pct}%</td><td ${cls}>${sign}${pnl}%</td></tr>`;
    }).join('');

    return `
      <div class="results-live">
        ${this._liveHeader(data, 'Morning Brief')}
        <div class="results-metrics">${this._metricsRow(data, resultsConfig)}</div>
      </div>
      ${positionsHtml ? `
        <table class="synthesis-positions">
          <thead><tr><th>Position</th><th>Weight</th><th>Overnight P&L</th></tr></thead>
          <tbody>${positionsHtml}</tbody>
        </table>` : ''}
      <div class="synthesis-brief">${(data.brief || '').replace(/\n/g, '<br>')}</div>`;
  },

  // ── Output Results ─────────────────────────────────────

  _renderOutputResults(data, resultsConfig) {
    const logHtml = (data.delivery_log || []).map(row => {
      const ok = row.status === 'delivered' || row.status === 'dry_run';
      const icon = ok ? '✓' : '✗';
      const cls = ok ? 'style="color:var(--color-pass)"' : 'style="color:var(--color-block)"';
      return `<tr ${cls}><td>${icon}</td><td>${row.channel}</td><td>${row.status}</td><td>${row.title}</td><td>${row.delivered_at ? row.delivered_at.slice(11,19) : ''}</td></tr>`;
    }).join('');

    return `
      <div class="results-live">
        ${this._liveHeader(data, 'Delivery Log')}
        <div class="results-metrics">${this._metricsRow(data, resultsConfig)}</div>
      </div>
      ${logHtml ? `
        <table class="output-log">
          <thead><tr><th></th><th>Channel</th><th>Status</th><th>Title</th><th>Time</th></tr></thead>
          <tbody>${logHtml}</tbody>
        </table>` : ''}`;
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
