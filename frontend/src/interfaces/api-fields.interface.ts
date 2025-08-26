export type PersonApiField = PersonApiLeafField | PersonApiGroupField;

export interface PersonApiLeafField {
  name: string;
  title: string;
}

export interface PersonApiGroupField {
  title: string;
  children: PersonApiField[];
}