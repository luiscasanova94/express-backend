import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('searching-modal')
export class SearchingModal extends LitElement {
  @property({ type: Boolean, reflect: true }) active = false;

  static styles = css`
    :host {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.75);
      justify-content: center;
      align-items: center;
      z-index: 1001;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    :host([active]) {
      display: flex;
      opacity: 1;
    }
    .modal-content {
      background-color: #1f2937;
      color: white;
      padding: 3rem 4rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #374151;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    :host([active]) .modal-content {
      transform: scale(1);
    }
    .icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem auto;
      background-color: #374151;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-container svg {
      width: 40px;
      height: 40px;
      color: #ebb85e;
    }
    .title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }
    .subtitle {
      font-size: 1rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }
  `;

  render() {
    return html`
      <div class="modal-content">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h2 class="title">Searching Over</h2>
        <p class="subtitle">318,656,334 records</p>
      </div>
    `;
  }
}