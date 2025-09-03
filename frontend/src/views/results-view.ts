import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { Person } from '../interfaces/person.interface';

@customElement('results-view')
export class ResultsView extends LitElement {
  @property({ type: Array }) persons: Person[] = [];
  @property({ type: String }) searchQuery: string | any = null;
  @property({ type: Boolean }) isLoading = false;
  @property({ type: String }) searchType: string | null = null;
  @property({ type: Number }) totalResults = 0;
  @property({ type: Number }) currentPage = 1;
  @property({ type: Number }) limit = 5;
  @property({ type: Object }) sort: any = {};
  @property({ type: Boolean }) isNewSearch = false; 

  static styles = css`
    .results-container {
      margin: 0;
      padding: 0;
    }
    .results-header {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .results-title {
      color: white;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .results-count {
      color: #ebb85e;
      font-weight: bold;
    }
    .controls-container {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 1rem;
      gap: 1.5rem;
    }
    .control-group label {
      color: #d1d5db;
      font-size: 0.875rem;
      font-weight: 500;
      margin-right: 0.5rem;
    }
    .control-select {
      background-color: #3d3d3d;
      color: white;
      border: 1px solid #555;
      border-radius: 6px;
      padding: 0.5rem;
      cursor: pointer;
    }
    .result-item {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .person-info {
      flex-grow: 1;
    }
    .person-name {
      font-size: 1.25rem;
      font-weight: bold;
      color: #ebb85e;
    }
    .person-details {
      font-size: 0.9rem;
      color: #d1d5db;
      margin-top: 0.25rem;
    }
    .report-button {
      background-color: #eb4538;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: background-color 0.3s;
      flex-shrink: 0;
      margin-left: 1rem;
    }
    .report-button:hover {
      background-color: #d33a2e;
    }
    .no-results {
      text-align: center;
      margin-top: 2rem;
      color: #ccc;
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 2.5rem;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .pagination-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
    }
    .pagination-button {
      background-color: #3d3d3d;
      color: white;
      border: 1px solid #555;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      margin: 0 0.25rem;
    }
    .pagination-button:hover:not(:disabled) { background-color: #eb4538; }
    .pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { color: #ccc; margin: 0 1rem; font-size: 0.9rem; }

    @media (max-width: 500px) {
      .result-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .report-button { width: 100%; margin-left: 0; }
    }
  `;

  _handleSeeReport(personId?: string) {
    if(personId) {
      Router.go(`/report/${personId}`);
    }
  }

  private _onSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    const [field, direction] = value.split('-');
    const sort = { [field]: direction };
    this._dispatchOptionsChange({ sort, page: 1 });
  }

  private _onLimitChange(e: Event) {
    const limit = parseInt((e.target as HTMLSelectElement).value, 10);
    this._dispatchOptionsChange({ limit, page: 1 });
  }
  
  private _onPageChange(newPage: number) {
      if (newPage < 1 || newPage > this.totalPages) return;
      this._dispatchOptionsChange({ page: newPage });
  }

  private _dispatchOptionsChange(detail: any) {
    this.dispatchEvent(new CustomEvent('options-changed', { detail, bubbles: true, composed: true }));
  }

  get totalPages() {
      return Math.ceil(this.totalResults / this.limit);
  }

  private _getSortValue() {
    if (!this.sort) return 'first_name-asc';
    const key = Object.keys(this.sort)[0];
    const value = this.sort[key];
    return `${key}-${value}`;
  }

  render() {
    const displayQuery = (typeof this.searchQuery === 'object' && this.searchQuery !== null && !Array.isArray(this.searchQuery))
      ? this.searchQuery.properties.full_address
      : this.searchQuery;

    return html`
      <div class="results-container">
        
        <div class="results-header">
            <h1 class="results-title">
                <span class="results-count">(${this.totalResults})</span> Records found for ${displayQuery}
            </h1>
            ${!this.isLoading && this.totalResults > 0 ? html`
            <div class="controls-container">
                <div class="control-group">
                <label for="sort-by">Sort by:</label>
                <select id="sort-by" class="control-select" @change=${this._onSortChange} .value=${this._getSortValue()}>
                    <option value="first_name-asc">Name (A-Z)</option>
                    <option value="first_name-desc">Name (Z-A)</option>
                    <option value="age-asc">Age (Youngest First)</option>
                    <option value="age-desc">Age (Oldest First)</option>
                </select>
                </div>
                <div class="control-group">
                <label for="limit">Show:</label>
                <select id="limit" class="control-select" @change=${this._onLimitChange} .value=${String(this.limit)}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
                </div>
            </div>
            ` : ''}
        </div>

        ${this.isLoading
          ? html`<div class="spinner-container"><div class="spinner"></div></div>`
          : this.persons.length === 0
            ? html`<p class="no-results">No results found.</p>`
            : html`
                ${this.persons.map(person => html`
                    <div class="result-item">
                      <div class="person-info">
                        <div class="person-name">${person.first_name} ${person.last_name}</div>
                        <div class="person-details">
                          ${person.age ? html`<span>${person.age} years</span> &bull;` : ''}
                          ${person.city ? html`<span> ${person.city}</span>` : ''}
                          ${person.state ? html`<span>, ${person.state}</span>` : ''}
                        </div>
                      </div>
                      <button class="report-button" @click=${() => this._handleSeeReport(person.id)}>
                        See Report
                      </button>
                    </div>
                `)}

                ${this.totalPages > 1 ? html`
                    <div class="pagination-container">
                        <button class="pagination-button" ?disabled=${this.currentPage === 1} @click=${() => this._onPageChange(this.currentPage - 1)}>
                            &laquo; Previous
                        </button>
                        <span class="page-info">Page ${this.currentPage} of ${this.totalPages}</span>
                        <button class="pagination-button" ?disabled=${this.currentPage >= this.totalPages} @click=${() => this._onPageChange(this.currentPage + 1)}>
                            Next &raquo;
                        </button>
                    </div>
                ` : ''}
              `
        }
      </div>
    `;
  }
}