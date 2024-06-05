import {Component, Injectable, OnInit} from '@angular/core';
import { PlaceholdersTableDescription } from './placeholders.table';
import { PlaceholderService } from '../service/placeholder.service';
import { PlaceholdersDialogDescription } from './placeholders.dialog';
import {forkJoin, Observable, of} from "rxjs";
import {Placeholder} from "../model/placeholder";
import {catchError, filter, map, tap} from "rxjs/operators";

@Component({
  selector: 'app-placeholders',
  templateUrl: './placeholders.component.html',
})
export class PlaceholdersComponent implements OnInit {
  constructor(
    public table: PlaceholdersTableDescription,
    public service: PlaceholderService,
    public dialog: PlaceholdersDialogDescription,
  ) {}

  ngOnInit(): void {}
}

export interface IParsedValue {
  word: string,
  placeholder: string,
  defaultValue: string,
  replace: string
}

@Injectable({providedIn: 'root'})
export class ReplacementHandler {
  private _placeholdersCache: Map<string, Placeholder> = new Map<string, Placeholder>();

  constructor(private placeholderService: PlaceholderService) {
  }

  handle(settingValue: string): Observable<string> {
    const parsed = this._parseSettingsString(settingValue);
    if(parsed && parsed.length > 0) {
      return forkJoin(parsed.map(p => this._getPlacholderValue$(p.placeholder)))
        .pipe(
          map((placeholders: Placeholder[]) =>  {
          const mappedParsedVals = this._replaceValueMapping(parsed, placeholders);
          return this._createReplacedString(mappedParsedVals, settingValue);
        }))
    }
    return of(settingValue);
  }

  private _getPlacholderValue$(placehoderName: string): Observable<Placeholder> {
    // Получаем заменители. Сначала смотрим в мапе _placeholderCache. Если есть -- возвращаем.
    // Если нет, то ищем на сервере
    // Если находим на сервере -- кладем в мапу и возвращаем, если статус ошибки 404 -- отдаем null
    let placeholder = this._placeholdersCache.get(placehoderName);
    if(placeholder) {
      return of(placeholder);
    }
    return this.placeholderService.readByName(placehoderName)
      .pipe(
        tap(placeholder => {
          this._placeholdersCache.set(placehoderName, placeholder)}),
        catchError(err => {
          if(err.status === 404) {
            return of(null);
          } else {
            throw new Error(err)
          }
        })
      )
  }

  private _parseSettingsString(string: string):  IParsedValue[] {
    // Парсим строку Setting.value.
    // На выходе получим массив объектов со свойствами
    // word -- исходное значение, placeholder -- заменитель,
    // defaultValue -- значение по умолчанию, replace -- на что меняем
    const regex = /\${[^${}]*\}/g
    return string.match(regex).map(word => {
      let placeholder = '';
      let defaultValue = '';
      const defaultValueIndex = word.indexOf(':');
      if(defaultValueIndex > -1) {
        defaultValue = word.substring(defaultValueIndex + 1, word.length - 1);
        placeholder = word.substring(2, defaultValueIndex);
      } else {
        placeholder = word.substring(2, word.length -1);
      }
      return {
        word,
        placeholder,
        defaultValue,
        replace: ''
      }
    })
  }

  private _createReplacedString(parsed: IParsedValue[], stringToReplace: string) {
    // Формируем строку с заменами
    let result = stringToReplace
    parsed.forEach(parsedValue => {
      result = result.replace(parsedValue.word, parsedValue.replace ? parsedValue.replace : parsedValue.defaultValue)
    });
    return result;
  }

  private _replaceValueMapping(parsed: IParsedValue[], placeholders: Placeholder[]): IParsedValue[] {
    // Маппим полученные заменители в объект полученный в результате парсинга строки
    return parsed.map(parsedValue => {
      const placeholder = placeholders
        .filter(p => !!p)
        .find(p => parsedValue.placeholder === p.name);
      return {...parsedValue, replace: placeholder?.value ?? ''}
    });
  }

}
