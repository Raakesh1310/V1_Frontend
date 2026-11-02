import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentsService } from '@modules/documents/services';
import * as date from 'date-and-time';

import { environment } from '../../../../environments/environment';
import { Order, OrderRespModel } from '../../models/doqfy.model';

@Component({
  selector: 'sbpro-doqfy-order-component',
  templateUrl: './doqfy-order-component.component.pug',
  styleUrls: ['./doqfy-order-component.component.scss']
})
export class DoqfyOrderComponentComponent implements OnInit {
  orderId = '';
  order?: Order | null;
  link?: string | null;
  generating = false;
  refreshing = false;
  docUrlPrefix = '';
  errors = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private documentService: DocumentsService,
    private router: Router,
    public cdr: ChangeDetectorRef
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        this.order = this.documentService.findById(resp.get('id') || '');
        if (!this.order) {
          this.goBack();
        }
        console.log(this.order);
      } catch (e) {
        console.error(e);
      }
    });
    this.refreshOrder();
  }

  getParsedDate(inputDate: Date) {
    if (!inputDate) {
      return '';
    }
    const d = new Date(inputDate);
    return date.format(d, 'DD MMM YYYY');
  }

  generateFileLink(type: String) {
    if (type === 'account') {
      return (this.docUrlPrefix = environment.apiHost + '/uploads/accounts/');
    } else {
      return (this.docUrlPrefix = environment.apiHost + '/uploads/documents/');
    }
  }

  ngOnInit(): void {}

  genLink() {
    this.generating = true;
    if (this.order) {
      this.documentService
        .getDownloadableLink(this.order.documentUuid)
        .subscribe((resp: any) => {
          this.generating = false;
          if (resp.result.genericResponse.apiStatusCode === 200) {
            this.link = resp.result.document.signed_url;
          } else {
            console.log('Unable to generate link');
          }
        });
    }
  }

  refreshOrder() {
    this.refreshing = true;
    if (this.order) {
      this.documentService.refreshOrder(this.order.orderUuid).subscribe(
        (resp: OrderRespModel) => {
          this.refreshing = false;
          console.log("DOQFY RESPONSE ",resp);
          if (resp.success) {
            if (this.order) {
              this.order = resp.result;
              this.cdr.detectChanges();
            }
          } else {
            console.log('Unable to generate link');
          }
        },
        err => {
          this.refreshing = true;
          console.log(err.error.errors);
          this.errors = err.error.errors || [
            'Server Error, Please try again later.'
          ];
          this.cdr.detectChanges();
        }
      );
    }
  }

  goBack() {
    this.router.navigate([environment.urlPortalPrefix + '/document/order']);
  }
}
