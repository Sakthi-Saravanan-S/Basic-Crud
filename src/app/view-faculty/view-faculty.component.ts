import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-faculty',
  templateUrl: './view-faculty.component.html',
  styleUrls: ['./view-faculty.component.scss'],
})
export class ViewFacultyComponent implements OnInit, OnDestroy {
  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _formBuilder: FormBuilder
  ) {}
  forms: any;
  fieldData: FormGroup;
  fieldArrList = [];
  defaultValue: { [Key: string]: any } = {};
  getRecSubscription: Subscription;
  ngOnInit(): void {
    this.getJsonInfo();
  }

  onEditFacultyClick(): void {
    this._router.navigate(['/edit-faculty']);
  }

  createFormControls(records: any): void {
    this.defaultValue = {};
    this.fieldArrList = [];
    if (records.forms.sections && Array.isArray(records.forms.sections)) {
      records.forms.sections.forEach((tabSection) => {
        tabSection.fields.forEach((fieldInfo) => {
          const fieldName = fieldInfo['properties']['name'];
          let defaultValue = fieldInfo['properties']['defaultValue'];
          this.fieldArrList.push(fieldName);
          if (fieldInfo['fieldType'] === 'date' && defaultValue) {
            defaultValue = defaultValue.split('T')[0];
          }
          this.defaultValue[fieldName] = defaultValue;
        });
      });
    }
    this.fieldData = this._formBuilder.group(this.formListInfo());
    for (const key in this.fieldData.controls) {
      if (Object.prototype.hasOwnProperty.call(this.fieldData.controls, key)) {
        const formControls = this.fieldData.controls[key];
        formControls.disable();
      }
    }
    this.fieldData.setValue(this.defaultValue);
  }

  formListInfo(): { [Key: string]: string } {
    const formControlGroup: { [Key: string]: string } = {};
    this.fieldArrList.forEach((element) => {
      formControlGroup[element] = '';
    });

    return formControlGroup;
  }

  onTabHeaderClick(e: any): void {
    let span = e.srcElement.children[0];
    if (span.classList.contains('top')) {
      span.classList.remove('top');
      span.classList.add('bottom');
    } else {
      span.classList.remove('bottom');
      span.classList.add('top');
    }
    let container = e.srcElement.nextSibling;
    if (container.classList.contains('hide')) {
      container.classList.remove('hide');
      container.classList.add('show');
    } else {
      container.classList.remove('show');
      container.classList.add('hide');
    }
  }

  getJsonInfo(): void {
    this.getRecSubscription = this._http
      .get<any>('../assets/db.json')
      .subscribe((result) => {
        this.forms = result['forms'];
        this.createFormControls(result);
      });
  }
  ngOnDestroy(): void {
    if (this.getRecSubscription) {
      this.getRecSubscription.unsubscribe();
    }
  }
}
