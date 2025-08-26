export interface Email {
    address?: string;
    deliverable?: boolean;
    marketable?: boolean;
}

export interface CellPhone {
    phone?: string;
    prepaid?: boolean;
    active?: boolean;
    account_level?: boolean;
}

export interface Child {
    age?: number;
    gender?: string;
}

export interface Interests {
    pets?: string;
    sports?: string;
    travel?: string;
    cooking?: string;
    accessories?: string;
    american_history?: string;
    auto_racing?: string;
    aviation?: string;
    bargains?: string;
    baseball?: string;
    basketball?: string;
    boating_sailing?: string;
    books?: string;
    camping?: string;
    cats?: string;
    collectibles?: string;
    computers?: string;
    crafts?: string;
    cruises?: string;
    dieting?: string;
    diy?: string;
    dogs?: string;
    electronics?: string;
    family?: string;
    fishing?: string;
    fitness?: string;
    football?: string;
    gambling?: string;
    games?: string;
    gardening?: string;
    golf?: string;
    gourmet_foods?: string;
    health?: string;
    history?: string;
    hobbies?: string;
    home_decor?: string;
    hunting?: string;
    internet?: string;
    motorcycles?: string;
    music?: string;
    outdoors?: string;
    photography?: string;
    politics?: string;
    religion?: string;
    charities?: string;
    credit_cards?: string;
    liberal_politics?: string;
    conservative_politics?: string;
    mens_apparel?: string;
    womens_apparel?: string;
    african_american_products?: string;
    asian_products?: string;
    beaches?: string;
    birds?: string;
    business?: string;
    cars?: string;
    catalogs?: string;
    childrens_apparel?: string;
    college?: string;
    comics?: string;
    cosmetics?: string;
    crocheting?: string;
    culture_arts?: string;
    current_events?: string;
    domestic_travel?: string;
    farming?: string;
    fiction?: string;
    gifts?: string;
    hispanic_products?: string;
    hockey?: string;
    home_office_products?: string;
    horses?: string;
    inspirational_products?: string;
    knitting?: string;
    magazines?: string;
    mens_fashion?: string;
    moneymaking_opportunities?: string;
    needlepoint?: string;
    nonfiction?: string;
    personal_finance?: string;
    personalized_products?: string;
    quilting?: string;
    rvs?: string;
    science?: string;
    science_fiction?: string;
    senior_products?: string;
    sewing?: string;
    skiing?: string;
    soccer?: string;
    stationery?: string;
    sweepstakes?: string;
    technology?: string;
    tennis?: string;
    tobacco?: string;
    trucks?: string;
    tv_movies?: string;
    wildlife?: string;
    womens_fashion?: string;
}

export interface Person {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    first_name?: string;
    middle_initial?: string;
    last_name?: string;
    generational_suffix?: string;
    gender?: string;
    family?: {
      id?: string;
      estimated_income?: string;
      adult_count?: number;
      children_count?: number;
      home_owner?: boolean;
      estimated_has_children?: boolean;
    };
    real_estate?: {
        estimated_home_value?: string;
    };
    age?: number;
    children?: Child[];
    children_count?: number;
    date_of_birth?: string;
    estimated_date_of_birth?: string[];
    address_type?: string;
    state?: string;
    city?: string;
    street?: string;
    county_code?: string;
    postal_code?: string;
    political_party_affiliation?: string;
    estimated_married?: string;
    registered_voter?: boolean;
    geocoordinate?: {
        lat?: number;
        lon?: number;
        latitude?: number;
        longitude?: number;
    };
    interests?: Interests;
    emails_count?: number;
    emails?: Email[];
    cell_phones?: CellPhone[];
    credit_card_types?: string[];
    digital_platforms?: string[];
    estimated_country_of_origin?: string;
    estimated_ethnic_group?: string;
    estimated_ethnicity?: string;
    estimated_head_of_family?: boolean;
    estimated_language?: string;
    estimated_primary_language?: string;
    estimated_religious_affiliation?: string;
    socioeconomic_status?: string;
}

export interface PersonSearchResponse {
    count: number;
    documents: Person[];
}