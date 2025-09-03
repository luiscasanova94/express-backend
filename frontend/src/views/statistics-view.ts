import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { statisticsService, StatisticsResponse } from '../services/statistics.service';

@customElement('statistics-view')
export class StatisticsView extends LitElement {
  @state() private stats: StatisticsResponse | null = null;
  @state() private isLoading = false;
  @state() private error = '';
  @state() private startDate = '';
  @state() private endDate = '';

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
    .date-range-picker {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }
    .date-range-picker input {
      background-color: #2d2d2d;
      border: 1px solid #444;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
    }
    .date-range-picker button {
      background-color: #eb4538;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .stat-card h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #ebb85e;
    }
    .stat-card p {
      margin: 0.5rem 0 0;
      font-size: 2rem;
      font-weight: bold;
    }
    .loading, .error {
      text-align: center;
      padding: 4rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.fetchStatistics();
  }

  async fetchStatistics() {
    this.isLoading = true;
    try {
      this.stats = await statisticsService.getStatistics(this.startDate, this.endDate);
    } catch (err) {
      this.error = 'Failed to load statistics.';
    } finally {
      this.isLoading = false;
    }
  }

  handleFilter() {
    this.fetchStatistics();
  }

  render() {
    if (this.isLoading) return html`<div class="loading">Loading...</div>`;
    if (this.error) return html`<div class="error">${this.error}</div>`;

    return html`
      <div class="container">
        <h1 class="title">Statistics</h1>
        <div class="date-range-picker">
          <input type="date" .value=${this.startDate} @input=${(e: any) => this.startDate = e.target.value}>
          <input type="date" .value=${this.endDate} @input=${(e: any) => this.endDate = e.target.value}>
          <button @click=${this.handleFilter}>Filter</button>
        </div>
        ${this.stats ? html`
          <div class="stats-container">
            <div class="stat-card">
              <h3>Total Queries</h3>
              <p>${this.stats.totalQueries}</p>
            </div>
            <div class="stat-card">
              <h3>Total Credits Used</h3>
              <p>${this.stats.totalCreditsUsed}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}