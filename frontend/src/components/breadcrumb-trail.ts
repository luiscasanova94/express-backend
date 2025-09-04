import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { breadcrumbService, Breadcrumb } from '../services/breadcrumb.service';

@customElement('breadcrumb-trail')
export class BreadcrumbTrail extends LitElement {
  @state() private _trail: Breadcrumb[] = [];

  private _subscription = () => {
    this._trail = [...breadcrumbService.breadcrumbs];
  };

  connectedCallback() {
    super.connectedCallback();
    breadcrumbService.subscribe(this._subscription);
    this._trail = [...breadcrumbService.breadcrumbs];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    breadcrumbService.unsubscribe(this._subscription);
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.5rem; /* Espacio entre el breadcrumb y el contenido */
    }
    nav {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      background-color: #2d2d2d; /* Fondo de la "caja" */
      border: 1px solid #444;      /* Borde sutil */
      border-radius: 8px;           /* Esquinas redondeadas */
      padding: 0.75rem 1.5rem;      /* Espaciado interno */
    }
    a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
    }
    a:hover {
      color: #ebb85e;
    }
    span.separator {
      margin: 0 0.75rem;
      color: #4b5563;
    }
    span.current {
      color: #d1d5db;
      font-weight: 500;
    }
  `;

  render() {
    if (this._trail.length <= 1) {
      return html``;
    }

    return html`
      <nav aria-label="breadcrumb">
        ${this._trail.map((crumb, index) => html`
          ${index > 0 ? html`<span class="separator">/</span>` : ''}
          ${index === this._trail.length - 1
            ? html`<span class="current" aria-current="page">${crumb.label}</span>`
            : html`<a href="${crumb.path}">${crumb.label}</a>`
          }
        `)}
      </nav>
    `;
  }
}