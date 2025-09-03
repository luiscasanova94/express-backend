import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('modal-element')
export class ModalElement extends LitElement {
  @property({ type: Boolean }) active = false;
  @property({ type: String }) message = '';
  @property({ type: String }) icon = '🚫'; // Icono por defecto para "no results"
  @property({ type: String }) buttonText = 'Close';

  static styles = css`
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
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background-color: #2d2d2d; /* Fondo oscuro similar al searching modal */
      color: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 400px;
      width: 90%;
      transform: translateY(20px);
      transition: transform 0.3s ease;
      border: 1px solid #444; /* Borde sutil */
    }

    .modal-overlay.active .modal-content {
      transform: translateY(0);
    }

    .modal-icon {
      font-size: 3rem; /* Tamaño grande para el icono */
      margin-bottom: 1rem;
      color: #eb4538; /* Color de acento */
    }

    .modal-message {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
      line-height: 1.5;
    }

    .modal-button {
      background-color: #eb4538; /* Color de acento para el botón */
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background-color 0.2s ease;
    }

    .modal-button:hover {
      background-color: #d33a2e;
    }
  `;

  private _closeModal() {
    this.dispatchEvent(new CustomEvent('click'));
  }

  render() {
    return html`
      <div class="modal-overlay ${this.active ? 'active' : ''}" @click=${this._closeModal}>
        <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-icon">${this.icon}</div>
          <p class="modal-message">${this.message}</p>
          <button class="modal-button" @click=${this._closeModal}>
            ${this.buttonText}
          </button>
        </div>
      </div>
    `;
  }
}