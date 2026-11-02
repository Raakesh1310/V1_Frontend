import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CardBase } from '@common/classes';
import { AccountsAdminService } from '@modules/accounts/services';
import _ from 'lodash';

@Component({
  selector: 'sbpro-card-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-navigation.component.pug',
  styleUrls: ['card-navigation.component.scss']
})
export class CardNavigationComponent extends CardBase
  implements OnInit, AfterViewInit {
  @ViewChild('fadeableSection') fadeableSection!: ElementRef<HTMLDivElement>;

  @Input() navNames!: string[];
  @Input() navNamesDisabled!: string[];
  @Input() templates!: TemplateRef<unknown>[];
  @Input() navType: 'tabbed' | 'pill' | 'vertical' = 'tabbed';

  @Input() selectedIndex = 0;
  @Input() selectedIndexForFade = 0;
  fadeableElement!: HTMLDivElement;

  constructor(public changeDetectorRef: ChangeDetectorRef) {
    super();

  }

  // CUSTOMIZED CODE STARTS HERE

  @Input() headerButtons: number[] = [];
  @Output() eventEmitterRefresh: EventEmitter<boolean> = new EventEmitter();
  @Output() eventEmitterToggle: EventEmitter<boolean> = new EventEmitter();

  onRefresh() {
    this.eventEmitterRefresh.emit(true);
  }

  onToggle() {
    this.eventEmitterToggle.emit(true);
  }

  // CUSTOMIZED CODE ENDS HERE

  isDisabled(tabName: string) {
    return _.includes(this.navNamesDisabled, tabName);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    this.fadeableElement = this.fadeableSection.nativeElement;
    this.fadeableElement.addEventListener('transitionend', event => {
      this.selectedIndexForFade = this.selectedIndex;
      this.fadeableElement.style.opacity = '100';
      this.changeDetectorRef.detectChanges();
    });
  }

  setSelectedIndex(index: number) {
    this.fadeableElement.style.opacity = '0';
    this.selectedIndex = index;
  }
}
