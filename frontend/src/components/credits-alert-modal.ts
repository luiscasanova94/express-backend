import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('credits-alert-modal')
export class CreditsAlertModal extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: Number }) availableCredits = 0;
  @property({ type: Number }) totalUsed = 0;
  @property({ type: Number }) limit = 0;

  static styles = css`
    :host {
      display: block;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      text-align: center;
      color: white;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    
    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: #888;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
    }
    
    .close-button:hover {
      color: white;
    }
    
    .modal-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      background-color: #eb4538;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #eb4538;
    }
    
    .modal-message {
      font-size: 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    
    .credits-info {
      background-color: #1a1a1a;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .credits-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .credits-row:last-child {
      margin-bottom: 0;
      font-weight: bold;
      color: #ebb85e;
      border-top: 1px solid #444;
      padding-top: 0.5rem;
    }
    
    .modal-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: #eb4538;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #d63e32;
    }
    
    .btn-secondary {
      background-color: #444;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #555;
    }
    
    .hidden {
      display: none;
    }
  `;

  closeModal() {
    console.log('closeModal called');
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('modal-closed', {
      bubbles: true,
      composed: true
    }));
  }

  goToStatistics() {
    this.closeModal();
    this.dispatchEvent(new CustomEvent('navigate-to-statistics', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.isOpen) {
      return html``;
    }

    return html`
      <div class="modal-overlay" @click=${this.closeModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <button class="close-button" @click=${this.closeModal}>&times;</button>
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h2 class="modal-title">Search Credits Limit Reached!</h2>
          
          <p class="modal-message">
            You have reached your search credits limit. 
            You cannot perform more searches until your credits are reset.
          </p>
          
          <div class="credits-info">
            <div class="credits-row">
              <span>Credits Used:</span>
              <span>${this.totalUsed}</span>
            </div>
            <div class="credits-row">
              <span>Total Limit:</span>
              <span>${this.limit}</span>
            </div>
            <div class="credits-row">
              <span>Credits Available:</span>
              <span>${this.availableCredits}</span>
            </div>
          </div>
          
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click=${this.closeModal}>
              Close
            </button>
            <button class="btn btn-primary" @click=${this.goToStatistics}>
              View Statistics
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
