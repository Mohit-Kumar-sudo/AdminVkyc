import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss']
})
export class ImageInputComponent implements OnInit {

  selectedFile: File;
  imageInfoForm: FormGroup;
  imageUrl: any;
  showImage = false;

  constructor(private _formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<ImageInputComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.imageInfoForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      source: new FormControl('', [Validators.required]),
      contentType: new FormControl('', [Validators.required])
    });
    if (this.data) {
      this.imageInfoForm.controls.title.setValue(this.data.metaDataValue.title);
      this.imageInfoForm.controls.source.setValue(this.data.metaDataValue.source);
      this.imageInfoForm.controls.contentType.setValue(this.data.metaDataValue.type);
      this.showImage = true;
      this.imageUrl = this.data.imageUrl;
    }
  }

  get title() {
    return this.imageInfoForm.get('title');
  }

  get source() {
    return this.imageInfoForm.get('source');
  }

  get contentType() {
    return this.imageInfoForm.get('contentType');
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    var reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (_event) => {
      this.imageUrl = reader.result;
      this.showImage = true;
    };
  }

  onSubmitImageInfo() {
    const data = {
      metaDataValue: {
        source: this.source.value,
        title: this.title.value,
        type: this.contentType.value
      },
      imageUrl: this.imageUrl
    };
    this.dialogRef.close(data);
  }

  doClose() {
    this.dialogRef.close();
  }

}
