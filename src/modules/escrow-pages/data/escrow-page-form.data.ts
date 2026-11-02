import {
  EscrowPageChildPage,
  EscrowPageCustomer,
  EscrowPageProduct
} from '@modules/escrow-pages/models';

export const escrowPages: EscrowPageChildPage[] = [
  {
    title: 'product Detail',
    deleted: false,
    childPageId: '1232123',
    escrowPage: '1232',
    escrowPageId: '2323',
    titleEditable: false,
    allowedFields: ['text'],
    index: 1,
    fields: [
      {
        fieldId: '1609749775550',
        index: 1,
        label: 'Product Name',
        placeholder: 'Enter Product Name',
        removable: false,
        required: false,
        type: 'text',
        value: 'edit value',
        verification: false,
        editable: true
      },
      {
        fieldId: '1609749775552',
        index: 3,
        label: 'Amount',
        placeholder: 'Enter Amount',
        removable: false,
        required: false,
        type: 'text',
        value: 'edit value',
        verification: false,
        editable: true
      },
      {
        fieldId: '1609749775551',
        index: 2,
        label: 'Product Description',
        placeholder: 'Describe your product',
        removable: false,
        required: false,
        type: 'text',
        value: 'edit value',
        verification: false,
        editable: true
      }
    ]
  },
  {
    title: 'Customer Detail',
    deleted: false,
    childPageId: '1232122',
    escrowPage: '12322',
    escrowPageId: '23232',
    titleEditable: false,
    allowedFields: ['inputs', 'pan', 'aadhaar', 'bank'],
    index: 2,
    fields: [
      {
        fieldId: '1609749775550',
        index: 1,
        label: 'Product Name',
        placeholder: 'Enter Product Name',
        removable: false,
        required: false,
        type: 'input',
        value: 'edit value',
        verification: false,
        editable: true
      },
      {
        fieldId: '1609749775552',
        index: 3,
        label: 'Amount',
        placeholder: 'Enter Amount',
        removable: false,
        required: false,
        type: 'input',
        value: 'edit value',
        verification: false,
        editable: true
      },
      {
        fieldId: '1609749775551',
        index: 2,
        label: 'Product Description',
        placeholder: 'Describe your product',
        removable: false,
        required: false,
        type: 'input',
        value: 'edit value',
        verification: false,
        editable: true
      },
      {
        fieldId: '1609749775553',
        index: 3,
        label: 'Product Description',
        placeholder: 'Describe your product',
        removable: false,
        required: false,
        type: 'input',
        value: 'edit value',
        verification: false,
        editable: true
      }
    ]
  }
];

export const page1Fields: EscrowPageProduct[] = [
  {
    label: 'Product Name',
    value: '',
    type: 'text',
    required: true,
    removable: false,
    index: 1,
    fieldId: 'productname1'
  },
  {
    label: 'Product Description',
    value: '',
    type: 'text',
    required: true,
    removable: false,
    index: 2,
    fieldId: 'productdescription2'
  },
  {
    label: 'Amount',
    value: '',
    type: 'text',
    required: true,
    removable: false,
    index: 3,
    fieldId: 'amount3'
  }
];

export const page2Fields: EscrowPageCustomer[] = [
  // {
  //   label: 'Amount',
  //   type: 'Number',
  //   required: true,
  //   index: 0,
  //   fieldId: 'amount0',
  //   verification: false,
  //   removable: false,
  //   placeholder: 'Enter Amount'
  // },
  {
    label: 'Name',
    type: 'text',
    required: true,
    index: 0,
    fieldId: 'name1',
    verification: false,
    removable: false,
    placeholder: 'Enter Name'
  },
  {
    label: 'Name',
    type: 'text',
    required: true,
    index: 1,
    fieldId: 'name1',
    verification: false,
    removable: false,
    placeholder: 'Enter Name'
  },
  {
    label: 'Email',
    type: 'text',
    required: true,
    index: 2,
    fieldId: 'email1',
    verification: false,
    removable: false,
    placeholder: 'Enter Email'
  }
];

export const formCache = {
  businessName: '',
  logo: '',
  accountId: '',
  title: '',
  pages: []
};
