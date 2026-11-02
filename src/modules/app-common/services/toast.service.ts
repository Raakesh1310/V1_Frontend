import { Injectable } from '@angular/core';
import {
  ToastMessage,
  ToastMessageData,
  ToastMessageOptions
} from '@common/models';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ToastService {
  toasts: ToastMessage[] = [];

  static errorHeaderOptions = {
    headerClasses: 'bg-danger text-white'
  };

  static successHeaderOptions = {
    headerClasses: 'bg-success text-white'
  };

  static defaultOptions: Partial<ToastMessageOptions> = {
    autohide: true,
    delay: 5000
  };

  constructor() {}

  show(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions
  ) {
    this.toasts.push({ header, body, uuid: uuid(), options });
  }

  remove(toastID: string) {
    this.toasts = this.toasts.filter(toast => toast.uuid !== toastID);
  }
}
