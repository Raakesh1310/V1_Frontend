import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-profile-mobile-update',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-mobile-update.component.pug',
  styleUrls: ['profile-mobile-update.component.scss']
})
export class ProfileMobileUpdateComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
