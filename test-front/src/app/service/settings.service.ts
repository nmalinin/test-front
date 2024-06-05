import { HttpClient } from "@angular/common/http";
import { Setting, SettingsAdapter } from "../model/setting";
import { environment } from "src/environments/environment";
import {forkJoin, Observable} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import { Injectable } from "@angular/core";
import { AbstractCrudService } from "./abstruct-crud.service";
import {ReplacementHandler} from "../placeholders/placeholders.component";

@Injectable({providedIn: 'root'})
export class SettingsService extends AbstractCrudService<Setting> {
    url: string;

    constructor(
      private httpClient: HttpClient,
      private rH: ReplacementHandler,
      private adapter: SettingsAdapter) {
        super();
        this.url = `${environment.url}/api/records`;
    }

    read(): Observable<Setting[]> {
        return this.httpClient.get(this.url)
            .pipe(
                mergeMap((records: any[]) => forkJoin(records.map(r => this.adapter.adaptWithReplacemant$(r)))));
    }

    readById(id: number): Observable<Setting> {
        return this.httpClient.get(`${this.url}/${id}`)
            .pipe(map(record => this.adapter.adapt(record)));
    }

    create(record: Setting): Observable<Setting> {
        return this.httpClient.post(this.url, record)
            .pipe(map(record => this.adapter.adapt(record)));
    }

    update(record: Setting): Observable<Setting> {
        return this.httpClient.put(this.url, record)
            .pipe(map(record => this.adapter.adapt(record)));
    }

    deleteById(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.url}/${id}`);
    }
}
