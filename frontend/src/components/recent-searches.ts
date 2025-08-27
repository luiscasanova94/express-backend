import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SearchHistoryEntry } from '../services/search-history.service';

@customElement('recent-searches')
export class RecentSearches extends LitElement {
  @property({ type: Array }) history: SearchHistoryEntry[] = [];

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto 2rem auto;
    }
    .widget-container {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1.5rem;
      color: white;
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #444;
      padding-bottom: 1rem;
    }
    .widget-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    .view-all-link {
      color: #eb4538;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }
    .history-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .history-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.2s;
      border: 1px solid #444;
      min-width: 0;
    }
    .history-item:hover {
      background-color: #374151;
    }
    .item-icon {
      margin-right: 1rem;
      color: #ebb85e;
      flex-shrink: 0;
    }
    .item-icon svg {
      width: 24px;
      height: 24px;
    }
    .item-details {
      flex-grow: 1;
      overflow: hidden;
    }
    .item-keyword {
      font-weight: 500;
      font-size: 0.9rem;
      /* --- AJUSTE CLAVE AQUÍ --- */
      white-space: normal; /* Permite que el texto salte a otra línea */
      word-break: break-word; /* Rompe palabras largas si es necesario */
    }
    .item-meta {
      font-size: 0.75rem;
      color: #9ca3af;
      text-transform: capitalize;
      white-space: nowrap;
    }
    
    @media (max-width: 640px) {
      .history-list {
        grid-template-columns: 1fr;
      }
    }
  `;

  private _rerunSearch(item: SearchHistoryEntry) {
    const event = new CustomEvent('rerun-search', {
      detail: item,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _getIconForType(type: string) {
    const icons = {
      name: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`,
      email: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>`,
      phone: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.759a11.03 11.03 0 006.354 6.354l.759-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>`,
      address: html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>`
    };
    return icons[type as keyof typeof icons] || '';
  }

  private _formatSort(sort: any): string {
    if (!sort) return '';
    const key = Object.keys(sort)[0];
    const direction = sort[key];
    return `${key.replace('_', ' ')} (${direction})`;
  }

  render() {
    if (this.history.length === 0) {
      return html``;
    }
    return html`
      <div class="widget-container">
        <div class="widget-header">
          <h2 class="widget-title">Recent Searches</h2>
          <a href="/search-history" class="view-all-link">View All &rarr;</a>
        </div>
        <ul class="history-list">
          ${this.history.map(item => html`
            <li class="history-item" @click=${() => this._rerunSearch(item)}>
              <div class="item-icon">${this._getIconForType(item.type)}</div>
              <div class="item-details">
                <div class="item-keyword" title=${item.keyword}>${item.keyword}</div>
                <div class="item-meta">${new Date(item.date).toLocaleDateString()} &bull; ${item.response?.documents?.length || 0} items</div>
                <div class="item-meta">Sort: ${this._formatSort(item.sort)}</div>
              </div>
            </li>
          `)}
        </ul>
      </div>
    `;
  }
}