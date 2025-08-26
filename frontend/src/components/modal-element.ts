import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('modal-element')
export class ModalElement extends LitElement {
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: String }) message = '';

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
      z-index: 1001;
    }
    :host([active]) {
      display: flex;
    }
    .modal-content {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }
    .modal-content button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="modal-content">
        <p>${this.message}</p>
        <button @click=${this._close}>Close</button>
      </div>
    `;
  }

  _close() {
    this.active = false;
  }
}