import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogField } from './dialog-field';

@Component({
  template: `
    <h2 mat-dialog-title>Диалог изменения модели</h2>
    <mat-dialog-content>
      <mat-form-field *ngFor="let field of data.fields">
        <mat-label>{{ field.name }}</mat-label>
        <input matInput (input)="handleFieldInput($event.target, field)" [value]="data.entity[field.key]" [disabled]="field.isDisabled" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Закрыть</button>
      <button mat-button mat-dialog-close color="primary">Сохранить</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class ModelEditDialog {
  constructor(
    public dialogRef: MatDialogRef<ModelEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
  }

  handleFieldInput(target: EventTarget, field: DialogField) {
    const value = (target as HTMLInputElement).value;
    const entity = this.data.entity;
    entity[field.key] = value;
    field.onInput(entity);
  }
}

export class DialogData {
    fields: DialogField[];
    entity: any;
}
