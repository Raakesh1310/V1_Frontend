import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-user-kyc-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-kyc.component.pug',
  styleUrls: ['user-kyc.component.scss']
})
export class UserKycComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
