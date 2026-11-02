import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-user-kyc-details-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-kyc-details.component.pug',
  styleUrls: ['user-kyc-details.component.scss']
})
export class UserKycDetailsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
