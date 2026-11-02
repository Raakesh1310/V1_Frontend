import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-document.component.pug',
  styleUrls: ['profile-document.component.scss']
})
export class ProfileDocUpload implements OnInit {
  constructor() {}
  ngOnInit() {}
}
