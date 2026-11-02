import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'sbpro-escrow-qr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-qr.component.pug',
  styleUrls: ['escrow-qr.component.scss']
})
export class EscrowQrComponent implements OnInit {
  openForm!: boolean;
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {}

  createEscrowQR() {
    this.openForm = true;
    this.cdr.detectChanges();
  }
}
