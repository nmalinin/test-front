import { Injectable } from "@angular/core";
import { DataModel } from "./data-model";
import {Observable} from "rxjs";
import {ReplacementHandler} from "../placeholders/placeholders.component";
import {map} from "rxjs/operators";

export class Setting implements DataModel {
    id: number | undefined;
    value: string;
    valueWithReplaces: string | undefined

    compare(other: Setting): boolean {
        return !!other && other.id == this.id;
    }
}

@Injectable({providedIn: 'root'})
export class SettingsAdapter {
  constructor(private rH: ReplacementHandler) {
  }
    adapt(item: any): Setting {
        const r = new Setting();

        r.id = item.id;
        r.value = item.value;

        return r;
    }

    adaptWithReplacemant$(item: any): Observable<Setting> {
      return this.rH.handle(item.value)
        .pipe(map(replacedValue => {
          const s = new Setting();
          s.id = item.id;
          s.value = item.value;
          s.valueWithReplaces = replacedValue
          return s;
        }))
    }
}
