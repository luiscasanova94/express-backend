import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('loading-overlay')
export class LoadingOverlay extends LitElement {
  @property({ type: Boolean, reflect: true }) active = false;

  static styles = css`
    :host {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    :host([active]) {
      display: flex;
    }
    .loading-content {
      text-align: center;
      color: white;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  render() {
    return html`
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }
}