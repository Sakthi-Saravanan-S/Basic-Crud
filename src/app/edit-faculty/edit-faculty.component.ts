import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-faculty',
  templateUrl: './edit-faculty.component.html',
  styleUrls: ['./edit-faculty.component.scss'],
})
export class EditFacultyComponent implements OnInit, OnDestroy {
  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _formBuilder: FormBuilder
  ) {}

  forms: any;
  fieldData: FormGroup;
  formId: string;
  getRecSubscription: Subscription;
  updRecSubscription: Subscription;
  fieldArrList = [];
  defaultValue: { [Key: string]: string } = {};
  showFormError: boolean = false;
  showSuccessMsg: boolean = false;
  imageSource: any = "assets/dummy-profile.png";
  ngOnInit(): void {
    this.getJsonInfo();
  }

  createFormControls(records: any): void {
    this.defaultValue = {};
    this.fieldArrList = [];
    if (records.forms.sections && Array.isArray(records.forms.sections)) {
      records.forms.sections.forEach((tabSection) => {
        tabSection.fields.forEach((fieldInfo) => {
          const fieldName = fieldInfo['properties']['name'];
          const required = fieldInfo['properties']['required'];
          let defaultValue = fieldInfo['properties']['defaultValue'];
          if (fieldInfo['fieldType'] === 'date' && defaultValue) {
            defaultValue = defaultValue.split('T')[0];
          }
          this.fieldArrList.push([fieldName, required, defaultValue]);
          this.defaultValue[fieldName] = defaultValue;
        });
      });
    }
    this.fieldData = this._formBuilder.group(this.formListInfo());
  }

  formListInfo(): { [Key: string]: any } {
    const formControlGroup: { [Key: string]: any } = {};
    this.fieldArrList.forEach((element) => {
      formControlGroup[element[0]] = [
        element[2] ? element[2] : '',
        element[1] ? Validators.required : null,
      ];
    });

    return formControlGroup;
  }
  onBackClick(): void {
    this._router.navigate(['']);
  }
  onNextClick(): void {
    window.scrollTo(0, document.body.scrollHeight);
  }
  onSubmitClick(): void {
    if (this.fieldData.valid) {
      this.showFormError = false;
      if (this.forms.sections && Array.isArray(this.forms.sections)) {
        this.forms.sections.forEach((tabSection) => {
          tabSection.fields.forEach((fieldInfo) => {
            if (fieldInfo['fieldType'] == 'date') {
              let fieldName = fieldInfo['properties']['name'];
              let timeStamp = this.convertDateToUnixTimestamp(
                this.fieldData.controls[fieldName].value
              );
              this.fieldData.controls[fieldName].setValue(timeStamp);
            }
          });
        });
      }
      const updInData = this.fieldData.getRawValue();
      this.updRecSubscription = this._http
        .put<any>('http://localhost:3000/fieldData/' + this.formId, updInData)
        .subscribe((result) => {
          this.showSuccessMsg = true;
          setTimeout(() => {
            this.showSuccessMsg = false;
          }, 3000);
        });
      this.fieldData.reset();
    } else {
      this.showFormError = true;
    }
  }
  convertDateToUnixTimestamp(dateIn: string): number {
    if (dateIn) {
      let date = new Date(dateIn);
      return date.getTime()/1000;
    } else {
      return null;
    }
  }

  updateImagePreview(e):any {
    var file = e.target.files[0];
    this.imageSource = e.srcElement.value;
      let reader = new FileReader();
      reader.onload = (e) => {
      let image = e.target.result;
      this.imageSource = image;
      };
    reader.readAsDataURL(file);
    return this.imageSource;
  }

  getJsonInfo(): void {
    this.getRecSubscription = this._http
      .get<any>('../assets/db.json')
      .subscribe((result) => {
        this.formId = result['fieldData'][0]['id'];
        this.forms = result['forms'];
        this.createFormControls(result);
      });
  }
  ngOnDestroy(): void {
    if (this.getRecSubscription) {
      this.getRecSubscription.unsubscribe();
    }
    if (this.updRecSubscription) {
      this.updRecSubscription.unsubscribe();
    }
  }
}
