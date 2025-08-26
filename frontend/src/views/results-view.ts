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

  static styles = css`
    .results-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .results-title {
      color: white;
      text-align: center;
      margin-bottom: 1.5rem;
      font-size: 1.75rem;
      font-weight: bold;
    }
    .result-item {
      background-color: #ebb85e;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .person-info {
        flex-grow: 1;
    }
    .person-name {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
    .person-details {
      font-size: 0.9rem;
      color: #555;
      margin-top: 0.25rem;
    }
    .report-button {
      background-color: #eb4538;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 1rem;
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
      padding: 1.5rem;
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
  `;

  _handleSeeReport(personId: string) {
    Router.go(`/report/${personId}`);
  }

  render() {
    const displayQuery = (typeof this.searchQuery === 'object' && this.searchQuery !== null && !Array.isArray(this.searchQuery))
      ? this.searchQuery.properties.full_address
      : this.searchQuery;

    return html`
      <div class="results-container">
        <h1 class="results-title py-10" id="results-title">Search Results for "${displayQuery}"</h1>

        ${this.isLoading
          ? html`
              <div class="spinner-container">
                <div class="spinner"></div>
              </div>
            `
          : this.persons.length === 0
            ? html`<p class="no-results">No results found.</p>`
            : this.persons.map(person => html`
                <div class="result-item">
                  <div class="person-info">
                    <div class="person-name">${person.first_name} ${person.last_name}</div>
                    <div class="person-details">
                      ${person.age ? html`<span>${person.age} years</span> &bull;` : ''}
                      ${person.city ? html`<span> ${person.city}</span>` : ''}
                      ${person.state ? html`<span>, ${person.state}</span>` : ''}
                    </div>
                  </div>
                  <button class="report-button font-semibold" @click=${() => this._handleSeeReport(person.id)}>
                    See Report
                  </button>
                </div>
              `)}
      </div>
    `;
  }
}