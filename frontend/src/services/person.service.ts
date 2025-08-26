import { ApiClient } from './api.service';
import { PersonSearchResponse } from '../interfaces/person.interface';
import { ApiClientOptions } from '../interfaces/api.interface';
import { personApiFields, personApiLimit } from '../config/api-fields.config';
import { PersonApiField } from '../interfaces/api-fields.interface';

export class PersonService {
  private apiClient: ApiClient;
  private readonly searchEndpoint = '/people/search';
  private readonly requiredPackages = ["people_enhanced_v6", "cell_phones_v2", "emails_v2"];

  constructor(options: ApiClientOptions) {
    this.apiClient = new ApiClient(options);
  }

  private flattenFieldNames(fields: PersonApiField[]): string[] {
    const result: string[] = [];
    const stack: PersonApiField[] = [...fields];
    while (stack.length > 0) {
      const current = stack.shift() as PersonApiField;
      if ((current as any).children && Array.isArray((current as any).children)) {
        stack.unshift(...((current as any).children as PersonApiField[]));
      } else if ((current as any).name) {
        result.push((current as any).name as string);
      }
    }
    return result;
  }

  private createRequestBody(filter: any, query?: string) {
    const body: any = {
      limit: personApiLimit,
      fields: this.flattenFieldNames(personApiFields),
      packages: this.requiredPackages,
    };
    if (filter) {
      body.filter = filter;
    }
    if (query) {
      body.query = query;
    }
    return body;
  }

  public findByName(name: string, filters?: any): Promise<PersonSearchResponse> {
    const body = this.createRequestBody(filters, name);
    return this.apiClient.post<PersonSearchResponse>(this.searchEndpoint, body);
  }

  public findByEmail(email: string): Promise<PersonSearchResponse> {
    const filter = { relation: 'matches', attribute: 'emails.address', value: email };
    const body = this.createRequestBody(filter);
    return this.apiClient.post<PersonSearchResponse>(this.searchEndpoint, body);
  }

  public findByPhone(phone: string): Promise<PersonSearchResponse> {
    const filter = { relation: 'matches', attribute: 'cell_phones.phone', value: phone };
    const body = this.createRequestBody(filter);
    return this.apiClient.post<PersonSearchResponse>(this.searchEndpoint, body);
  }

  public findByAddress(address: any): Promise<PersonSearchResponse> {
    const properties = address.properties;
    const street = properties?.address_line1;
    
    const addressParts = [
        street,
        properties?.place,      
        properties?.region,    
        properties?.postcode  
    ];
    const fullAddressWithoutCountry = addressParts.filter(Boolean).join(' ');

    if (fullAddressWithoutCountry && street) {
      const filter = {
        relation: "matches",
        attribute: "street",
        value: street.toLowerCase(),
      };
      const body = this.createRequestBody(filter, fullAddressWithoutCountry);
      return this.apiClient.post<PersonSearchResponse>(this.searchEndpoint, body);
    } else {
      throw new Error('Invalid address object: missing address properties');
    }
  }
}