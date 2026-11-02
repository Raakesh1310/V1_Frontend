import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-list-user-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-user.component.pug',
  styleUrls: ['list-user.component.scss']
})
export class ListUserComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
