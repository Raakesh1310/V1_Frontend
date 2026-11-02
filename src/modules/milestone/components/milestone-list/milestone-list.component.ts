import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MilestoneModel } from '@modules/milestone/models';
import { MilestoneService } from '@modules/milestone/services';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-milestone-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-list.component.pug',
  styleUrls: ['milestone-list.component.scss']
})
export class MilestoneListComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
