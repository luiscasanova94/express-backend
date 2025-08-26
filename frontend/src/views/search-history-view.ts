import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { searchHistoryService, SearchHistoryEntry } from '../services/search-history.service';
import { stateService } from '../services/state.service';
import { Router } from '@vaadin/router';

@customElement('search-history-view')
export class SearchHistoryView extends LitElement {
  @state() private history: SearchHistoryEntry[] = [];
  @state() private isLoading = false;
  @state() private error = '';
  @state() private currentPage = 1;
  @state() private totalPages = 1;

  static styles = css`
    :host {
        display: block;
        color: white;
    }
    .container {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 0 1rem;
    }
    .title {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 2rem;
        border-bottom: 2px solid #444;
        padding-bottom: 1rem;
    }
    .table-container {
        background-color: #1a1a1a;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #444;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    th, td {
        padding: 1rem 1.5rem;
    }
    thead {
        background-color: #2a2a2a;
    }
    th {
        color: #ebb85e;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
    }
    tbody tr {
        border-bottom: 1px solid #333;
    }
    tbody tr:last-child {
        border-bottom: none;
    }
    tbody tr:hover {
        background-color: #252525;
    }
    .action-button {
        background-color: #eb4538;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    }
    .action-button:hover {
        background-color: #d33a2e;
    }
    .pagination {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 1.5rem;
        background-color: #2a2a2a;
        border-top: 1px solid #444;
    }
    .pagination button {
        background: none;
        border: 1px solid #555;
        color: #ccc;
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        cursor: pointer;
        margin: 0 0.25rem;
        transition: all 0.2s;
    }
    .pagination button:hover:not(:disabled) {
        background-color: #eb4538;
        border-color: #eb4538;
        color: white;
    }
    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .pagination .page-info {
        margin: 0 1rem;
        font-size: 0.9rem;
    }
    .loading, .error {
        text-align: center;
        padding: 4rem;
    }
    .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-transform: capitalize;
    }
    .type-badge svg {
        width: 1.25rem;
        height: 1.25rem;
    }
    .sort-info {
      font-style: italic;
      font-size: 0.8rem;
      color: #9ca3af;
      text-transform: capitalize;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.fetchHistory(this.currentPage);
  }

  async fetchHistory(page: number) {
    this.isLoading = true;
    try {
      const response = await searchHistoryService.getHistory(page);
      this.history = response.history;
      this.currentPage = response.currentPage;
      this.totalPages = response.totalPages;
    } catch (err) {
      this.error = 'Failed to load search history.';
    } finally {
      this.isLoading = false;
    }
  }

   handleViewReport(item: SearchHistoryEntry) {
    if (item.resultType === 'empty') return;

    stateService.persons = item.response.documents.map((p: any, i: number) => ({
      ...p,
      id: `person_${Date.now()}_${i}`
    }));
    stateService.searchQuery = item.keyword;
    stateService.searchType = item.type;

    if (item.resultType === 'set') {
      Router.go('/');
    } else if (stateService.persons[0]) {
      Router.go(`/report/${stateService.persons[0].id}`);
    }
  }

  renderType(type: string) {
    // --- CORRECCIÓN AQUÍ ---
    // Verificamos si 'type' es un string válido antes de usarlo.
    if (!type || typeof type !== 'string') {
        return html`<span class="type-badge">N/A</span>`;
    }

    const icons = {
      name: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`,
      email: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>`,
      phone: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.03 11.03 0 006.354 6.354l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>`,
      address: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>`
    };
    return html`
      <span class="type-badge">
        ${icons[type as keyof typeof icons] || ''}
        <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </span>
    `;
  }
  
  render() {
    if (this.isLoading) return html`<div class="loading">Loading...</div>`;
    if (this.error) return html`<div class="error">${this.error}</div>`;

    return html`
      <div class="container">
        <h1 class="title">Search History</h1>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Search Keyword</th>
                <th>Type</th>
                <th>Count</th>
                <th>Sort</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.history.map(item => html`
                <tr>
                  <td>${new Date(item.date).toLocaleDateString()}</td>
                  <td>${item.keyword}</td>
                  <td>${this.renderType(item.type)}</td>
                  <td>${item.count}</td>
                  <td>
                    ${item.sort ? html`
                      <div class="sort-info">
                        ${Object.keys(item.sort)[0].replace('_', ' ')}
                        (${item.sort[Object.keys(item.sort)[0]]})
                      </div>
                    ` : 'N/A'}
                  </td>
                  <td>
                    ${item.resultType !== 'empty' ? html`
                      <button class="action-button" @click=${() => this.handleViewReport(item)}>
                        View Report
                      </button>
                    ` : nothing}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
          ${this.totalPages > 1 ? html`
          <div class="pagination">
            <span class="page-info">Page ${this.currentPage} of ${this.totalPages}</span>
            <button @click=${() => this.fetchHistory(1)} ?disabled=${this.currentPage === 1}>First</button>
            <button @click=${() => this.fetchHistory(this.currentPage - 1)} ?disabled=${this.currentPage <= 1}>‹</button>
            <button @click=${() => this.fetchHistory(this.currentPage + 1)} ?disabled=${this.currentPage >= this.totalPages}>›</button>
            <button @click=${() => this.fetchHistory(this.totalPages)} ?disabled=${this.currentPage === this.totalPages}>Last</button>
          </div>
          ` : nothing }
        </div>
      </div>
    `;
  }
}