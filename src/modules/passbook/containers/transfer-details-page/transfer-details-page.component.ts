import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sbpro-transfer-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-details-page.component.pug',
  styleUrls: ['transfer-details-page.component.scss']
})
export class TransferDetailsPageComponent implements OnInit {
  public transferId!: string | null;

  constructor(private activatedRoute: ActivatedRoute) {
    try {
      this.transferId = this.activatedRoute.snapshot.paramMap.get('id');
    } catch (e) {
      console.log(e);
    }
  }

  ngOnInit() {}
}
