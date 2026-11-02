import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-helpdesk-track',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './helpdesk-track.component.pug',
  styleUrls: ['helpdesk-track.component.scss']
})
export class HelpdeskTrackComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
