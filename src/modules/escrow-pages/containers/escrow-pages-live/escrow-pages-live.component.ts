import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import { UtilityService } from '@common/services';
import { EscrowPageFieldEditModalComponent } from '@modules/escrow-page-widgets/components';
import EscrowPageWidgetComponent from '@modules/escrow-page-widgets/components/escrow-page-widget.class';
import { escrowPageWidgets } from '@modules/escrow-page-widgets/data/widgets.data';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';
import { EscrowPageChildPage } from '@modules/escrow-pages/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-escrow-pages-live',
  templateUrl: './escrow-pages-live.component.pug',
  styleUrls: ['./escrow-pages-live.component.scss']
})
export class EscrowPagesLiveComponent implements OnInit, AfterViewInit {
  innerWidth: any;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private utilityService: UtilityService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    // for (const fieldComponentsKey in this._fieldComponents) {
    //   this._fieldTypes.push(utilityService.firstCapitalize(fieldComponentsKey));
    // }
  }

  get fields(): EscrowPageFieldWidget[] {
    return this._fields;
  }

  set fields(value: EscrowPageFieldWidget[]) {
    this._fields = value;
  }

  get data(): EscrowPageChildPage {
    return this._data;
  }

  set data(value: EscrowPageChildPage) {
    this._data = value;
    if (!value) {
      return;
    }
    this._fields = value.fields ? value.fields : [];
  }

  get title() {
    if (!this._data) {
      return '';
    }
    return this._data.title;
  }

  set title(value: string) {
    if (!this._data) {
      return;
    }
    this._data.title = value;
  }

  get titleEditable() {
    if (!this._data) {
      return '';
    }
    return this._data.titleEditable;
  }

  @Input() change: EventEmitter<EscrowPageChildPage> = new EventEmitter<
    EscrowPageChildPage
  >();

  private _selectedFieldType!: string | null;
  private _fieldTypes: string[] = Object.keys(escrowPageWidgets);

  get fieldTypes(): string[] {
    return this._fieldTypes;
  }

  @ViewChildren('viewContainer', { read: ViewContainerRef })
  viewContainers!: QueryList<ViewContainerRef>;

  private _fieldComponents = escrowPageWidgets;

  private _data!: EscrowPageChildPage;

  private _fields: EscrowPageFieldWidget[] = [
    {
      fieldId: 'name1',
      label: 'Name',
      type: 'input',
      placeholder: 'Name',
      index: 1,
      required: true,
      removable: false,
      value: 'John Doe',
      verification: false,
      editable: false
    },
    {
      fieldId: 'name2',
      label: 'isReady',
      type: 'checkbox',
      placeholder: 'isReady',
      index: 1,
      required: false,
      removable: false,
      value: true,
      verification: false,
      editable: false
    }
  ];

  // private onSelectFieldType() {
  //   if (!this._selectedFieldType) {
  //     return;
  //   }
  //   /**
  //    * Handle the add field
  //    */
  //   this.addField(this._selectedFieldType);
  //   this._selectedFieldType = null;
  // }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
    console.log(this.innerWidth);
    console.log('onReSize');
  }

  renderTemplate() {
    console.log('View Container Found: ' + this.viewContainers.length);
    /**
     * Clear the view Containers first
     */
    for (const viewContainer of this.viewContainers.toArray()) {
      viewContainer.clear();
    }
    for (let i = 0; i < this.viewContainers.toArray().length; i++) {
      try {
        const viewContainer: ViewContainerRef = this.viewContainers.toArray()[
          i
        ];

        const fieldObject = this._fields[i];

        /**
         * Create a instance for the Given Field
         */
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
          // @ts-ignore
          this._fieldComponents[fieldObject.type]
        );
        let widget: ComponentRef<EscrowPageWidgetComponent>;
        // widget

        // @ts-ignore
        widget = viewContainer.createComponent(componentFactory);

        widget.instance.label = fieldObject.label;
        widget.instance.formControlName = fieldObject.fieldId;
        widget.instance.name = fieldObject.fieldId;
        widget.instance.placeholder = fieldObject.placeholder;
        widget.instance.required = fieldObject.required;
        widget.instance.verification = fieldObject.verification;
        widget.instance.type = fieldObject.type;
        widget.instance.removable = fieldObject.removable;
        widget.instance.editable = fieldObject.editable;

        // @ts-ignore
        widget.instance.value = fieldObject.value;
        widget.instance.remove.subscribe((rm: boolean) => {
          if (rm) {
            console.log('delete request for element ', i);
            this.removeField(i);
          }
        });
        // tslint:disable-next-line:no-any
        widget.instance.change.subscribe((instance: EscrowPageFieldWidget) => {
          console.log('instance : ', instance);
          // console.log('Value changed');
          // console.log(value);
          // fieldObject.value = value;
          this._fields[i].value = instance.value;
          this._fields[i].label = instance.label;
          this._fields[i].placeholder = instance.placeholder;
          this._fields[i].required = instance.required;
          this._fields[i].verification = instance.verification;

          if (this._data) {
            this._data.fields = this.fields ? this._fields : [];
          }
          // console.log(this._fields[i].value);
          // console.log(this._fields);

          this.change.emit(this._data);
        });

        // widget.instance

        /**
         * Form Param
         */

        // let validators: Validators[];
        // validators = [];
        // if (fieldObject.required) {
        //   validators.push(Validators.required);
        // }

        // param[fieldObject.fieldId] = [fieldObject.value, validators];
      } catch (e) {
        console.error(e.message);
      }
    }
    // console.log(param);
    // this.fieldForm = this.formBuilder.group(param);
  }

  generateFieldId = () => {
    return new Date().getTime().toString();
  };

  addField() {
    console.log('Adding Field');
    const field = {
      fieldId: this.generateFieldId(),
      index: 1,
      placeholder: '',
      removable: true,
      required: false,
      value: null,
      label: 'Label',
      type: 'text',
      verification: false,
      editable: true
    };
    this._fields.push(field);
    if (this._data) {
      this._data.fields = this._fields;
    }
    console.log('Field added');
    console.log(this._fields);

    this.changeDetectorRef.detectChanges();
    this.renderTemplate();
    this.changeDetectorRef.detectChanges();
    this.change.emit(this._data);
  }

  removeField(i: number) {
    console.log('removing field');
    this._fields.splice(i, 1);
    if (this._data) {
      this._data.fields = this._fields;
    }
    console.log('field removed');
    this.changeDetectorRef.detectChanges();
    this.renderTemplate();
    this.changeDetectorRef.detectChanges();
    this.change.emit(this._data);
  }

  ngAfterViewInit() {
    this.renderTemplate();
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    // this.bindForm();
    this.innerWidth = window.innerWidth;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this._fields, event.previousIndex, event.currentIndex);
    this.change.emit(this._data);
  }

  updateTitle($event: Event) {
    if (!this._data) {
      console.log('_data found null to store the title');
      return;
    }
    // @ts-ignore
    this._data.title = ($event.target as Element).value;

    this.change.emit(this._data);
  }

  openFieldModal() {
    const modalRef = this.modalService.open(EscrowPageFieldEditModalComponent, {
      windowClass: 'lg'
    });
    modalRef.componentInstance.doClose = modalRef;
    console.log('\n\n\noptions : ', this._data.allowedFields);
    modalRef.componentInstance.selectOptions = this._data.allowedFields;
    modalRef.componentInstance.emitField.subscribe((field: any) => {
      this._fields.push(field);
      if (this._data) {
        this._data.fields = this._fields;
      }
      console.log('Field added');
      console.log(this._fields);

      this.changeDetectorRef.detectChanges();
      this.renderTemplate();
      this.changeDetectorRef.detectChanges();
      this.change.emit(this._data);
    });
  }
}
