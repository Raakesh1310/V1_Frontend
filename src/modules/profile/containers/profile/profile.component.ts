import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.pug',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
