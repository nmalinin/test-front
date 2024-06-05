import { Injectable } from '@angular/core';
import { DialogDescription } from '../table/dialog/dialog-description';
import { DialogField } from '../table/dialog/dialog-field';
import {ReplacementHandler} from "../placeholders/placeholders.component";

@Injectable({ providedIn: 'root' })
export class RecordsDialog extends DialogDescription {
  constructor(private sH: ReplacementHandler) {
    super([
      new DialogField('Идентификатор', 'id').setDisabled(true),
      new DialogField('Значение', 'value').setOnInput(e => {
        this.sH
          .handle(e.value)
          .subscribe(res => e.valueWithReplaces = res);
      }),
      new DialogField('Значение с заменами', 'valueWithReplaces').setDisabled(
        true
      ),
    ]);
  }
}
