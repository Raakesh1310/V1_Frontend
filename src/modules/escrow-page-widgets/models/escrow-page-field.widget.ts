export interface EscrowPageFieldWidget {
  verification: boolean;
  removable: boolean;
  index: number;
  label: string;
  placeholder: string;
  type: string;
  value: string | string[] | boolean | number | number[] | null;
  required: boolean;
  fieldId: string;
  editable: boolean;
}
