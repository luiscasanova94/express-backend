import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { RouterLocation } from '@vaadin/router';
import { stateService } from '../services/state.service';
import { Person } from '../interfaces/person.interface';
import { formatPhoneNumber, formatIsoToLongEnglish, formatCurrency } from '../utils/formatters';
import mainStyles from '../styles/main.css?inline';
import mapboxgl from 'mapbox-gl';
import mapboxCss from 'mapbox-gl/dist/mapbox-gl.css?inline';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ethnicityMap, ethnicGroupMap, languageMap, primaryLanguageMap, religiousAffiliationMap, countryAlpha2Map } from '../data/culture-catalogs.data';
import { breadcrumbService } from '../services/breadcrumb.service';
import { trackingService } from '../services/tracking.service';
import '../components/breadcrumb-trail';

const creditCardTypeMap: { [key: string]: { name: string; icon: string } } = {
    'travel_entertainment': {
        name: 'Travel & Entertainment',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>`
    },
    'retail': {
        name: 'Retail',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>`
    },
    'specialty_retail': {
        name: 'Specialty Retail',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" /></svg>`
    },
    'bank': {
        name: 'Bank',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>`
    },
};

const addressTypeMap: { [key: string]: { name: string; icon: string } } = {
    'house_number': {
        name: 'House Number',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>`
    },
    'street': {
        name: 'Street',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>`
    },
    'intersection': {
        name: 'Intersection',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>`
    },
    'po_box': {
        name: 'PO Box',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`
    },
    'unknown': {
        name: 'Unknown',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>`
    },
    'highrise': {
        name: 'High-rise',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6M9 20.25h6" /></svg>`
    }
};

const reportSections = [
  { id: 'person_details', title: 'Person Details' },
  { id: 'phone_numbers', title: 'Phone Numbers', countKey: 'cell_phones' },
  { id: 'emails', title: 'Emails', countKey: 'emails' },
  { id: 'addresses', title: 'Addresses' },
  { id: 'relationships', title: 'Relationships' },
  { id: 'financial', title: 'Financial' },
  { id: 'politics', title: 'Politics' },
  { id: 'culture', title: 'Culture' },
  { id: 'interests', title: 'Interests' },
];

@customElement('report-view')
export class ReportView extends LitElement {
  @query('#map') private mapContainer!: HTMLElement;

  private map?: mapboxgl.Map;
  private marker?: mapboxgl.Marker;

  private _renderGenericSection(sectionId: string) {
    const p = this.person;
    switch (sectionId) {
      case 'person_details':
        return html`
          <div class="my-0 py-0">
            <h3 class="owner-title my-0 py-0">${p?.first_name} ${p?.last_name}${p?.age ? ', Age ' + p?.age : ''}${p?.gender === 'F' ? ', Female' : (p?.gender === 'M' ? ', Male' : '')}</h3>
            <div>
              ${p?.date_of_birth ? html`<p><strong>Born on:</strong> ${formatIsoToLongEnglish(p.date_of_birth)}</p>` : ''}
              ${p?.political_party_affiliation ? html`<p><strong>Political Affiliation:</strong> ${p.political_party_affiliation}</p>` : ''}
              ${p?.city && p?.state ? html`<p><strong>Location:</strong> ${p.city}, ${p.state}</p>` : ''}
            </div>
          </div>
        `;
      case 'phone_numbers':
        return p?.cell_phones && p.cell_phones.length > 0 ? html`
          ${p.cell_phones.map(phone => html`
            <div class="sub-box-item">
              <p><strong>Phone:</strong> ${formatPhoneNumber(phone.phone)}</p>
              <div class="subtitle-info">
                <span>Prepaid: ${phone.prepaid ? 'Yes' : 'No'}</span> |
                <span>Active: ${phone.active ? 'Yes' : 'No'}</span>
              </div>
            </div>
          `)}
        ` : html`<p>No phone numbers found.</p>`;
      case 'emails':
        return p?.emails && p.emails.length > 0 ? html`
          ${p.emails.map(email => html`
            <div class="sub-box-item">
              <p><strong>Address:</strong> ${email.address}</p>
              <div class="subtitle-info">
                <span>Deliverable: ${email.deliverable ? 'Yes' : 'No'}</span> |
                <span>Marketable: ${email.marketable ? 'Yes' : 'No'}</span>
              </div>
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

    if (!fullAddress) {
      return html`<p>No addresses found.</p>`;
    }

    const addressTypeInfo = p?.address_type ? addressTypeMap[p.address_type.toLowerCase()] : null;

    return html`
      <div class="sub-box-item">
        <p><strong>Location:</strong> ${fullAddress}</p>
        ${addressTypeInfo ? html`
          <div class="subtitle-info icon-item">
            <div>Address type: </div>
            <div class="icon">${unsafeHTML(addressTypeInfo.icon)}</div>
            <span>${addressTypeInfo.name}</span>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  private _formatSocioeconomicStatus(status: any): { symbols: string; description: string } {
    const numericStatus = parseInt(status, 10);

    if (isNaN(numericStatus)) {
      return { symbols: 'N/A', description: 'Not Available' };
    }

    if (numericStatus <= 33) {
      return { symbols: '$', description: 'Lower Tier' };
    } else if (numericStatus <= 66) {
      return { symbols: '$$', description: 'Middle Tier' };
    } else {
      return { symbols: '$$$', description: 'Upper Tier' };
    }
  }

  private _renderFinancialSection() {
    const p = this.person;
    const hasIncome = !!p?.family?.estimated_income;
    const hasHomeValue = !!p?.real_estate?.estimated_home_value;
    const hasCreditCards = p?.credit_card_types && p.credit_card_types.length > 0;
    const hasSocioeconomicStatus = !!p?.socioeconomic_status;

    if (!hasIncome && !hasHomeValue && !hasCreditCards && !hasSocioeconomicStatus) {
      return html`<p>No financial data found.</p>`;
    }
    
    const creditCardItems = (p?.credit_card_types || [])
      .map(type => {
        const normalizedType = type.toLowerCase().replace(/ /g, '_');
        return creditCardTypeMap[normalizedType];
      }).filter(Boolean);

    const socioeconomic = this._formatSocioeconomicStatus(p?.socioeconomic_status);

    return html`
      ${hasIncome ? html`<div class="sub-box-item"><strong>Estimated Income:</strong> <p>${formatCurrency(p!.family!.estimated_income)}</p></div>` : ''}
      ${hasHomeValue ? html`<div class="sub-box-item"><strong>Estimated Home Value:</strong> <p>${formatCurrency(p!.real_estate!.estimated_home_value)}</p></div>` : ''}
      ${hasSocioeconomicStatus ? html`
        <div class="sub-box-item">
          <strong>Socioeconomic Status:</strong> 
          <p class="socioeconomic-status" title=${socioeconomic.description}>${socioeconomic.symbols}</p>
        </div>
      ` : ''}
      
      ${creditCardItems.length > 0 ? html`
        <div class="sub-box-item">
          <strong>Credit Card Types:</strong>
          <div class="credit-card-grid">
            ${creditCardItems.map(card => html`
              <div class="credit-card-item">
                <div class="icon">${unsafeHTML(card.icon)}</div>
                <span>${card.name}</span>
              </div>
            `)}
          </div>
        </div>
      ` : ''}
    `;
  }

  private _renderRelationshipsSection() {
    const p = this.person;
    if (!p?.estimated_married && !p?.family?.adult_count && !p?.children) {
      return html`<p>No relationship data found.</p>`;
    }
    return html`
      <div class="data-grid">
        ${p?.estimated_married ? html`<div class="sub-box-item"><strong>Marital Status:</strong> <p>${this._capitalize(p.estimated_married)}</p></div>` : ''}
        ${p?.estimated_head_of_family ? html`<div class="sub-box-item"><strong>Head of Family:</strong> <p>${p.estimated_head_of_family ? 'Yes' : 'No'}</p></div>` : ''}
        ${p?.family?.adult_count ? html`<div class="sub-box-item"><strong>Adults in Household:</strong> <p>${p.family.adult_count}</p></div>` : ''}
        ${p?.family?.home_owner ? html`<div class="sub-box-item"><strong>Home Owner:</strong> <p>${p.family.home_owner ? 'Yes' : 'No'}</p></div>` : ''}
      </div>

      ${p?.children && p.children.length > 0 ? html`
        <div class="sub-box-item mt-4">
          <div class="flex items-center gap-2 mb-2">
            <strong class="text-white">Children</strong>
          </div>
          <div class="children-grid">
            ${p.children.map(child => html`
              <div class="child-card">
                <div class="child-gender-icon ${child.gender?.toLowerCase()}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="child-details">
                  <div class="child-age">Age ${child.age}</div>
                  <div class="child-gender">${child.gender === 'F' ? 'Female' : (child.gender === 'M' ?'Male':'')}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      ` : ''}
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
        return value && parseInt(String(value), 10) >= 1;
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

  private _renderCultureSection() {
    const p = this.person;
    const cultureFields = [
      { label: 'Estimated Ethnicity', value: ethnicityMap.get(p?.estimated_ethnicity??'')??'' },
      { label: 'Estimated Ethnic Group', value: ethnicGroupMap.get(p?.estimated_ethnic_group??'')??'' },
      { label: 'Estimated Language', value: languageMap.get(p?.estimated_language??'')??'' },
      { label: 'Primary Language (Est.)', value: primaryLanguageMap.get(p?.estimated_primary_language?? '')??'' },
      { label: 'Estimated Religious Affiliation', value: religiousAffiliationMap.get(p?.estimated_religious_affiliation??'')??'' },
      { label: 'Estimated Country Of Origin', value: (p?.estimated_country_of_origin ? (countryAlpha2Map.get(String(p.estimated_country_of_origin).toUpperCase()) || p.estimated_country_of_origin) : '') }
    ].filter(field => field.value);

    if (cultureFields.length === 0) {
      return html`<p>No culture data found.</p>`;
    }

    return html`
      <div class="data-grid">
        ${cultureFields.map(field => html`
          <div class="sub-box-item">
            <strong>${field.label}:</strong>
            <p>${this._capitalize(String(field.value))}</p>
          </div>
        `)}
      </div>
    `;
  }
  
  private _renderPoliticsSection() {
      const p = this.person;
      if (!p?.political_party_affiliation && typeof p?.registered_voter === 'undefined') {
          return html`<p>No political data found.</p>`;
      }
      return html`
        <div class="data-grid">
            ${p?.political_party_affiliation ? html`<div class="sub-box-item"><strong>Political Affiliation:</strong><p>${this._capitalize(p.political_party_affiliation)}</p></div>` : ''}
            ${typeof p?.registered_voter !== 'undefined' ? html`<div class="sub-box-item"><strong>Registered Voter:</strong><p>${p.registered_voter ? 'Yes' : 'No'}</p></div>` : ''}
        </div>
      `;
  }

  private _renderDigitalPlatformsSection() {
      const p = this.person;
      if (!p?.digital_platforms || p.digital_platforms.length === 0) {
          return html`<p>No digital platform data found.</p>`;
      }
      return html`
        <div class="data-grid">
            ${p.digital_platforms.map(platform => html`
                <div class="sub-box-item text-center">
                    <p class="font-semibold">${this._capitalize(platform)}</p>
                </div>
            `)}
        </div>
      `;
  }

  @property({ attribute: false })
  location!: RouterLocation;

  @state() private person: Person | null = null;
  @state() private activeSection: string = '';
  @state() private activeLine: boolean = false;
  @state() private searchType: string | null = null;
  @state() private isTracking = false;
  @state() private isUpdatingTracking = false;

  async connectedCallback() {
    super.connectedCallback();
    breadcrumbService.navigate('Report', this.location.pathname);
    window.scrollTo(0, 0);
    const personId = this.location.params.id as string;
    if (personId) {
      this.person = stateService.persons.find(p => p.id === personId) || null;
    }
    this.searchType = stateService.searchType;
    if (this.searchType === 'phone') {
      this.activeLine = this.person?.cell_phones?.find(c => c.phone === stateService.searchQuery)?.active ?? false;
    }
    
    if (this.person) {
      this.checkTrackingStatus();
    }
  }

  async checkTrackingStatus() {
    if (!this.person?.id) return;
    try {
      const status = await trackingService.getTrackingStatus(this.person.id);
      this.isTracking = status.isTracking;
    } catch (error) {
      console.error("Failed to check tracking status", error);
    }
  }

  async _handleTrackingChange(e: Event) {
    if (!this.person || this.isUpdatingTracking) return;

    this.isUpdatingTracking = true;
    const checkbox = e.target as HTMLInputElement;
    const shouldTrack = checkbox.checked;

    try {
      if (shouldTrack) {
        await trackingService.trackPerson(this.person);
      } else {
        await trackingService.untrackPerson(this.person.id);
      }
      this.isTracking = shouldTrack;
    } catch (error) {
      console.error("Failed to update tracking status", error);
      checkbox.checked = !shouldTrack;
    } finally {
      this.isUpdatingTracking = false;
    }
  }

  firstUpdated() {
    if (this.person?.geocoordinate) {
      this.initMap();
    }
  }
  
  disconnectedCallback(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.marker = undefined;
    }
    super.disconnectedCallback();
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

    mapboxgl.accessToken = (import.meta as any).env.VITE_MAPBOX_API_TOKEN;

    if (this.map) {
      this.map.remove();
    }

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lon, lat],
      zoom: 13,
    });

    this.map.on('load', () => {
      this.marker = new mapboxgl.Marker({ color: '#eb4538' })
        .setLngLat([lon, lat])
        .addTo(this.map!);

      this.map!.jumpTo({ center: [lon, lat], zoom: 14 });

      requestAnimationFrame(() => this.map!.resize());
    });

    const ro = new ResizeObserver(() => this.map?.resize());
    ro.observe(this.mapContainer);

    (this.map as any)._ro = ro;

    this.map.on('remove', () => {
      (this.map as any)?._ro?.disconnect?.();
    });
  }

  static styles = [
    unsafeCSS(mapboxCss),
    unsafeCSS(mainStyles),
    css`
    
      /* Estilos para Desktop y Tablets */
      .report-wrapper { max-width: 1024px; margin: 2rem auto; padding: 0 1rem; display: flex; gap: 2rem; align-items: flex-start; }
      .left-column { display: flex; flex-direction: column; flex: 0 0 220px; position: sticky; top: 2rem; }
      #map { position: relative; height: 200px; border-radius: 8px; margin-bottom: 1rem; flex-shrink: 0; overflow: hidden; }
      .side-menu { flex-grow: 1; }
      .menu-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; margin-bottom: 0.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid #444; background-color: #2d2d2d; color: #ccc; }
      .menu-item:hover { background-color: #3d3d3d; color: white; }
      .menu-item.active { background-color: #ebb85e; color: #333; font-weight: bold; border-color: #ebb85e; }
      .go-back-button { justify-content: flex-start; margin-bottom: 1rem; background-color: #4A5568; color: white; font-weight: 500; }
      .go-back-button:hover { background-color: #2D3748; }
      .owner-title { color: #eb4538; font-size: 20px; margin-bottom: 0.5rem; }
      .menu-badge { background-color: #eb4538; color: white; border-radius: 99px; padding: 2px 8px; font-size: 0.75rem; font-weight: 500; }
      .main-content { flex: 1 1 auto; }
      .content-box { background-color: #2d2d2d; border: 1px solid #444; border-radius: 8px; margin-bottom: 1.5rem; padding: 1.5rem; color: white; }
      .content-box:last-child { margin-bottom: 0; }
      .content-box h2 { font-size: 1.5rem; font-weight: bold; }
      .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
      .sub-box-item { background-color: #3d3d3d; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; border: 1px solid #555; }
      .sub-box-item:last-child { margin-bottom: 0; }
      .sub-box-item p { margin: 0; color: #ccc; }
      .sub-box-item strong { display: block; margin-bottom: 0.25rem; color: white; }
      .subtitle-info { font-size: 0.8rem; color: #aaa; margin-top: 0.5rem; }
      .subtitle-info span { margin-right: 0.5rem; }
      .credit-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem; }
      .credit-card-item { display: flex; align-items: center; gap: 0.75rem; background-color: #4a4a4a; padding: 0.75rem; border-radius: 6px; border: 1px solid #555; }
      .icon { color: #ebb85e; width: 24px; height: 24px; flex-shrink: 0; }
      .icon svg { width: 100%; height: 100%; }
      .icon-item { display: flex; align-items: center; gap: 0.5rem; }
      .icon-item .icon { width: 16px; height: 16px; }
      .mobile-bottom-back-button { display: none; }
      .socioeconomic-status { font-size: 1.5rem; color: #ebb85e; font-weight: bold; margin-top: 0.25rem; }

      /* --- ESTILOS PARA MÓVILES --- */
      @media (max-width: 767px) {
        .report-wrapper { flex-direction: column; padding: 0; margin: 0; }
        .left-column { position: static; width: 100%; padding: 1rem; padding-bottom: 0; }
        .side-menu { display: none; }
        .main-content { width: 100%; }
        #map { height: 250px; margin-bottom: 0; }
        .mobile-bottom-back-button { display: flex; margin: 1rem; justify-content: center; }
        .content-box { border-radius: 0; border-left: none; border-right: none; }
      }

      .info-icon {
        color: #9ca3af;
        cursor: help;
      }
      .children-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }
      .child-card {
        background-color: #4a4a4a;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border: 1px solid #555;
      }
      .child-gender-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }
      .child-gender-icon.f { background-color: #ec4899; }
      .child-gender-icon.m { background-color: #3b82f6; }
      .child-gender-icon svg { width: 24px; height: 24px; }
      .child-details {
        text-align: left;
      }
      .child-age {
        font-weight: bold;
        color: white;
        font-size: 1.1rem;
      }
      .child-gender {
        color: #d1d5db;
        font-size: 0.8rem;
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #2d2d2d;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 0.5rem 1.5rem;
        margin-bottom: 1.5rem;
      }
        .report-header breadcrumb-trail {
        flex: 1;
        /* Se definen las variables para anular los estilos del breadcrumb */
        --breadcrumb-bg-color: transparent;
        --breadcrumb-border: none;
        --breadcrumb-padding: 0;
        --breadcrumb-radius: 0;
      }
      .monitoring-switch-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .monitoring-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #d1d5db;
      }
      .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
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
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
      }
      input:checked + .slider {
        background-color: #eb4538;
      }
      input:checked + .slider:before {
        transform: translateX(20px);
      }
      .slider.round {
        border-radius: 24px;
      }
      .slider.round:before {
        border-radius: 50%;
      }
    `,
  ];

  private _scrollToSection(sectionId: string) {
    const targetElement = this.shadowRoot?.getElementById(`section-${sectionId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
    }
  }

  private _goBack() { window.history.back(); }

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
          <div class="menu-item go-back-button" @click=${this._goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Go Back</span>
          </div>
        </div>
      </div>
    `;
  }

  private _renderContentSections() {
    return html`
      <div id="main-content-scroll-area" class="main-content">
        <div class="report-header">
          <breadcrumb-trail></breadcrumb-trail>
          <div class="monitoring-switch-container">
            <span class="monitoring-label">Monitoring</span>
            <label class="switch">
              <input 
                type="checkbox" 
                .checked=${this.isTracking}
                ?disabled=${this.isUpdatingTracking}
                @change=${this._handleTrackingChange}
              >
              <span class="slider round"></span>
            </label>
          </div>
        </div>
        ${reportSections.map(section => {
          const renderMethod = (this as any)[`_render${this._capitalize(section.id.replace(/_/g, ''))}Section`];
          const content = typeof renderMethod === 'function'
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
        
        <div class="menu-item go-back-button mobile-bottom-back-button" @click=${this._goBack}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Go Back</span>
        </div>
      </div>
    `;
  }

  private _capitalize = (s: any): string => {
    if (typeof s !== 'string' || !s) {
      return '';
    }
    return s.replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  };
}