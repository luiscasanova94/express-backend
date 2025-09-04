import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { trackingService } from '../services/tracking.service';
import { Person } from '../interfaces/person.interface';
import { stateService } from '../services/state.service';
import { Router } from '@vaadin/router';
import { breadcrumbService } from '../services/breadcrumb.service';
import mainStyles from '../styles/main.css?inline';
import '../components/breadcrumb-trail';

@customElement('tracked-results-view')
export class TrackedResultsView extends LitElement {
  @state() private trackedPeople: Person[] = [];
  @state() private isLoading = true;
  @state() private error = '';
  @state() private updatingTrackingId: string | null = null;

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
      border-bottom: 2px solid #444; /* Añadido */
      padding-bottom: 1rem; /* Añadido */
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .person-card {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 1.5rem;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.2s;
    }
    .person-card:hover {
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .card-content {
        cursor: pointer;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s;
    }
    .card-content:hover {
        transform: translateY(-2px);
    }
    .person-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #ebb85e;
      margin-bottom: 0.25rem;
      line-height: 1.2;
    }
    .person-meta {
        font-size: 0.85rem;
        color: #d1d5db;
        margin-bottom: 1rem;
    }
    .person-info {
      font-size: 0.9rem;
      color: #d1d5db;
      margin-bottom: 0.25rem;
    }
    .loading, .error, .empty {
      text-align: center;
      padding: 4rem;
      font-size: 1.2rem;
    }
    .tracking-switch-container {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 10;
    }
    .tracking-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #d1d5db;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 20px;
    }
    .switch input { 
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #4b5563;
      transition: .4s;
      border-radius: 20px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #eb4538;
    }
    input:checked + .slider:before {
      transform: translateX(18px);
    }
    input:disabled + .slider {
        cursor: not-allowed;
        opacity: 0.7;
    }

    ${unsafeCSS(mainStyles)}
  `;

  async connectedCallback() {
    super.connectedCallback();
    breadcrumbService.navigate('Tracked Results', '/tracked-results');
    await this._fetchTrackedPeople();
  }
  
  private async _fetchTrackedPeople() {
    this.isLoading = true;
    this.error = '';
    try {
      const results = await trackingService.getTrackedPeople();
      this.trackedPeople = results.map(r => {
        if (!r.personData.id) {
          r.personData.id = r.dataAxleId;
        }
        return r.personData;
      });
    } catch (err) {
      this.error = 'Failed to load tracked people.';
    } finally {
      this.isLoading = false;
    }
  }

  private _viewReport(person: Person) {
    if (this.updatingTrackingId !== person.id) {
      stateService.persons = [person];
      Router.go(`/report/${person.id}`);
    }
  }

  private async _handleTrackingChange(person: Person, e: Event) {
    e.stopPropagation();
    if (!person.id || this.updatingTrackingId === person.id) return;

    this.updatingTrackingId = person.id;
    const checkbox = e.target as HTMLInputElement;
    const shouldTrack = checkbox.checked;

    try {
      if (!shouldTrack) {
        await trackingService.untrackPerson(person.id);
        this.trackedPeople = this.trackedPeople.filter(p => p.id !== person.id);
      }
    } catch (error) {
      console.error("Failed to update tracking status", error);
      checkbox.checked = !shouldTrack;
    } finally {
      this.updatingTrackingId = null;
    }
  }

  render() {
    if (this.isLoading) return html`<div class="loading">Loading...</div>`;
    if (this.error) return html`<div class="error">${this.error}</div>`;
    
    return html`
      <div class="container">
        <breadcrumb-trail></breadcrumb-trail>
        <h1 class="title mt-5">Tracked Results</h1>

        ${this.trackedPeople.length === 0
          ? html`<div class="empty">You are not tracking anyone yet.</div>`
          : html`
              <div class="grid">
                ${this.trackedPeople.map(person => html`
                  <div class="person-card">
                    <div class="tracking-switch-container">
                        <span class="tracking-label">Tracking</span>
                        <label class="switch">
                            <input 
                                type="checkbox" 
                                .checked=${true}
                                ?disabled=${this.updatingTrackingId === person.id}
                                @change=${(e: Event) => this._handleTrackingChange(person, e)}
                            >
                            <span class="slider round"></span>
                        </label>
                    </div>

                    <div class="card-content" @click=${() => this._viewReport(person)}>
                      <div class="person-name">${person.first_name} ${person.last_name}</div>
                      <p class="person-meta">
                        ${person.age ? html`Age ${person.age}` : ''}
                        ${person.age && person.gender ? html` | ` : ''}
                        ${person.gender === 'F' ? 'Female' : (person.gender === 'M' ? 'Male' : '')}
                      </p>
                      ${person.city && person.state ? html`<p class="person-info"><strong>Location:</strong> ${person.city}, ${person.state}</p>` : ''}
                    </div>
                  </div>
                `)}
              </div>
            `}
      </div>
    `;
  }
}