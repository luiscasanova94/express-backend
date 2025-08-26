import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { RouterLocation } from '@vaadin/router';
import { stateService } from '../services/state.service';
import { Person } from '../interfaces/person.interface';
import { formatPhoneNumber, formatIsoToLongEnglish } from '../utils/formatters';
import mainStyles from '../styles/main.css?inline';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const reportSections = [
  { id: 'current_owner_details', title: 'Current Owner Details' },
  { id: 'phone_numbers', title: 'Phone Numbers', countKey: 'cell_phones' },
  { id: 'addresses', title: 'Addresses' },
  { id: 'relationships', title: 'Relationships' },
  { id: 'financial', title: 'Financial' },
  { id: 'emails', title: 'Emails', countKey: 'emails' },
  { id: 'interests', title: 'Interests' },
];

@customElement('phone-report-view')
export class PhoneReportView extends LitElement {

  @query('#map') private mapContainer!: HTMLElement;

  private _renderGenericSection(sectionId: string) {
    const p = this.person;
    switch(sectionId) {
        case 'current_owner_details':
            return html`
                <div class="my-0 py-0">
                  <h3 class="owner-title my-0 py-0">${p?.first_name} ${p?.last_name}${p?.age ? ', Age ' + p?.age :''}${p?.gender === 'F' ? ', Female': ( p?.gender === 'M' ? ', Male': '')}</h3>
                  <div>
                    <p><strong>Born on</strong> ${p?.date_of_birth? formatIsoToLongEnglish(p?.date_of_birth) : ''}</p>
                    ${p?.political_party_affiliation ? html`<p><strong>Political Affiliation:</strong> ${p.political_party_affiliation}</p>`: ''}
                  </div>
                </div>
              `;
        case 'phone_numbers':
            return p?.cell_phones && p.cell_phones.length > 0 ? html`
                ${p.cell_phones.map(phone => html`
                    <div class="sub-box-item">
                      <strong>Phone:</strong> 
                      <p>${formatPhoneNumber(phone.phone)}</p>
                    </div>
                `)}
            ` : html`<p>No phone numbers found.</p>`;
        case 'emails':
            return p?.emails && p.emails.length > 0 ? html`
                ${p.emails.map(email => html`
                    <div class="sub-box-item">
                        <strong>Address:</strong> <p>${email.address}</p>
                    </div>
                `)}
            ` : html`<p>No emails found.</p>`;
        default:
            return html`<p>No data available for this section.</p>`;
    }
  }

  private _renderAddressesSection() {
    const p = this.person;
    const fullAddress = [p?.street, p?.city, p?.state, p?.postal_code].filter(Boolean).join(', ');

    if (fullAddress) {
        return html`
            <div class="sub-box-item">
                <strong>Location:</strong>
                <p>${fullAddress}</p>
            </div>
        `;
    } else {
        return html`<p>No addresses found.</p>`;
    }
  }

  private _renderFinancialSection() {
    const p = this.person;
    if (!p?.family?.estimated_income && !p?.real_estate?.estimated_home_value) {
        return html`<p>No financial data found.</p>`;
    }
    return html`
        ${p?.family?.estimated_income ? html`<div class="sub-box-item"><strong>Estimated Income:</strong> <p>${p.family.estimated_income}</p></div>` : ''}
        ${p?.real_estate?.estimated_home_value ? html`<div class="sub-box-item"><strong>Estimated Home Value:</strong> <p>${p.real_estate.estimated_home_value}</p></div>` : ''}
    `;
  }

  private _renderRelationshipsSection() {
    const p = this.person;
    if (!p?.estimated_married && !p?.family?.adult_count && !p?.family?.children_count) {
        return html`<p>No relationship data found.</p>`;
    }
    return html`
        <div class="data-grid">
            ${p?.estimated_married ? html`<div class="sub-box-item"><strong>Marital Status:</strong> <p>${p.estimated_married}</p></div>` : ''}
            ${p?.family?.adult_count ? html`<div class="sub-box-item"><strong>Adults in Household:</strong> <p>${p.family.adult_count}</p></div>` : ''}
            ${p?.family?.children_count ? html`<div class="sub-box-item"><strong>Children in Household:</strong> <p>${p.family.children_count}</p></div>` : ''}
        </div>
    `;
  }

  private _renderInterestsSection() {
    const interests = this.person?.interests;
    if (!interests) {
        return html`<p>No interests found.</p>`;
    }

    const availableInterests = Object.keys(interests)
      .filter(key => {
        const value = interests[key as keyof typeof interests];
        return value && parseInt(value, 10) >= 1;
      });

    if (availableInterests.length === 0) {
        return html`<p>No significant interests found.</p>`;
    }

    return html`
        <div class="data-grid">
            ${availableInterests.map(interest => html`
                <div class="sub-box-item text-center">
                    <p class="font-semibold">${this._capitalize(interest.replace(/_/g, ' '))}</p>
                </div>
            `)}
        </div>
    `;
  }

  @property({ attribute: false })
  location!: RouterLocation;

  @state() private person: Person | null = null;
  @state() private activeSection: string = 'current_owner_details';
  @state() private activeLine: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    const personId = this.location.params.id as string;
    if (personId) {
      this.person = stateService.persons.find(p => p.id === personId) || null;
    }
    this.activeLine = this.person?.cell_phones?.find(c => c.phone === stateService.searchQuery)?.active ?? false;
  }

  firstUpdated() {
    if (this.person?.geocoordinate) {
      this.initMap();
    }
  }

  private initMap() {
    const geocoordinate = this.person?.geocoordinate;
    if (!geocoordinate || !this.mapContainer) return;

    const lat = geocoordinate.lat ?? geocoordinate.latitude;
    const lon = geocoordinate.lon ?? geocoordinate.longitude;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
        console.error('Formato de geocoordenadas inválido:', geocoordinate);
        return;
    }

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;
    
    const map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lon, lat],
        zoom: 13,
    });

    map.on('load', () => {
        new mapboxgl.Marker()
          .setLngLat([lon, lat])
          .addTo(map);
    });
  }

  static styles = [
    unsafeCSS(mainStyles),
    css`
    .report-wrapper {
      max-width: 1024px;
      margin: 2rem auto;
      padding: 0 1rem;
      display: flex;
      gap: 2rem;
    }
    .left-column {
      display: flex;
      flex-direction: column;
      flex: 0 0 220px;
    }
    #map {
      height: 200px;
      border-radius: 8px;
      margin-bottom: 1rem;
      flex-shrink: 0;
      overflow: hidden;
    }
    .side-menu {
      flex-grow: 1;
      overflow-y: auto;
    }
    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #444;
      background-color: #2d2d2d;
      color: #ccc;
    }
    .menu-item:hover {
      background-color: #3d3d3d;
      color: white;
    }
    .menu-item.active {
      background-color: #ebb85e;
      color: #333;
      font-weight: bold;
      border-color: #ebb85e;
    }

    .owner-title{
      color: #eb4538;
      font-size: 20px;
    }
    .menu-badge {
      background-color: #eb4538;
      color: white;
      border-radius: 99px;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .main-content {
      flex: 1 1 auto;
      overflow-y: auto; 
      height: calc(100vh - 160px);
      position: relative;
      scrollbar-width: none; 
      -ms-overflow-style: none; 
    }

    .main-content::-webkit-scrollbar {
      display: none;
    }

    .content-box {
      background-color: #2d2d2d;
      border: 1px solid #444;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      padding: 1.5rem;
      color: white;
    }
    .content-box:last-child {
      margin-bottom: 0; 
    }
    .content-box h2 {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    .data-item p {
        margin: 0;
        color: #ccc;
    }
    .data-item strong {
        color: white;
    }
    .sub-box-item {
        background-color: #3d3d3d;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid #555;
    }
    .sub-box-item:last-child {
        margin-bottom: 0;
    }
    .sub-box-item p {
        margin: 0;
        color: #ccc;
    }
    .sub-box-item strong {
        display: block;
        margin-bottom: 0.25rem;
        color: white;
    }
  `];


  private _scrollToSection(sectionId: string) {
    const scrollContainer = this.shadowRoot?.getElementById('main-content-scroll-area');
    const targetElement = this.shadowRoot?.getElementById(`section-${sectionId}`);
    
    if (scrollContainer && targetElement) {
      const topPosition = targetElement.offsetTop;
      scrollContainer.scrollTo({
        top: topPosition,
        behavior: 'smooth'
      });
      
      this.activeSection = sectionId;
    }
  }
  
  private _renderSideMenu() {
    return html`
      <div class="left-column">
        ${this.person?.geocoordinate ? html`<div id="map"></div>` : ''}
        <div class="side-menu">
          ${reportSections.map(section => {
            const countKey = section.countKey as keyof Person | undefined;
            const count = countKey && this.person && Array.isArray(this.person[countKey]) 
              ? (this.person[countKey] as any[]).length 
              : 0;
            return html`
              <div
                class="menu-item ${this.activeSection === section.id ? 'active' : ''}"
                @click=${() => this._scrollToSection(section.id)}>
                <span>${section.title}</span>
                ${count > 0 ? html`<span class="menu-badge">${count}</span>` : ''}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
  
  private _renderContentSections() {
    return html`
      <div id="main-content-scroll-area" class="main-content">
         <div id="section-overview" class="content-box">
              <h2 class="mb-2">${ formatPhoneNumber(this.person?.cell_phones?.find(c => c.phone === stateService.searchQuery)?.phone) }</h2>
              <div class="flex items-center gap-x-4">
                <span class="inline-flex items-center before:content-['•'] before:mr-1 ${this.activeLine ? 'before:text-green-500' : 'before:text-red-500'} before:text-3xl">
                ${ this.activeLine 
                    ? 'Active' 
                    : 'Inactive' }
                </span>
                ${this.person?.city && this.person?.state ? html`
                    <span class="text-gray-300">${this.person.city}, ${this.person.state}</span>
                ` : ''}
              </div>
          </div>
        ${reportSections.map(section => {
            const renderMethod = this[`_render${this._capitalize(section.id)}Section`];
            const content = renderMethod 
                ? renderMethod.call(this) 
                : this._renderGenericSection(section.id);
            return html`
                <div id="section-${section.id}" class="content-box">
                    <h2 class="border-b-2 border-b-[#444] mb-3">${section.title}</h2>
                    ${content}
                </div>
            `;
        })}
      </div>
    `;
  }
  
  render() {
    if (!this.person) {
      return html`<p class="text-white text-center p-8">Person data not found. Please try another search.</p>`;
    }

    return html`
      <div class="report-wrapper">
        ${this._renderSideMenu()}
        ${this._renderContentSections()}
      </div>
    `;
  }

  private _capitalize = (s: string) => {
    return s.replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  };
}