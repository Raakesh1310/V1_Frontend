import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sbpro-digital-escrow-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './digital-escrow-list.component.pug',
  styleUrls: ['digital-escrow-list.component.scss']
})
export class DigitalEscrowListComponent implements OnInit {
  bankAccountNo: string = '';
  @Input() merchantId = '';
  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.paramMap.subscribe(resp => {
      this.bankAccountNo = resp.get('accountId') || '';
    });
  }
  ngOnInit() {
    console.log(this.merchantId);
  }
}
