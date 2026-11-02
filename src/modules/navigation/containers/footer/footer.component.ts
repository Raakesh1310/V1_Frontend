import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

@Component({
  selector: 'sb-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.pug',
  styleUrls: ['footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() dark = false;
  constructor() {}
  ngOnInit() {}
}
