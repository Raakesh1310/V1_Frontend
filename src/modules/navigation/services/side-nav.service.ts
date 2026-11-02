import { Injectable } from '@angular/core';
import { UtilityService } from '@modules/app-common/services';
import { Subject } from 'rxjs';

const _expand$ = new Subject<string[]>();

export interface ExpandedTable {
  [index: string]: boolean;
}

let expandedTable: ExpandedTable = {};

const EXPANDED_TABLE_CACHE_NAME = 'sbpro-expanded-table';

@Injectable()
export class SideNavService {
  constructor(private utilityService: UtilityService) {
    const cachedExpandedTable = this.utilityService.getStoredObject<
      ExpandedTable
    >(EXPANDED_TABLE_CACHE_NAME);
    if (cachedExpandedTable) {
      expandedTable = cachedExpandedTable;
    }
  }

  get expand$() {
    return _expand$;
  }

  isExpanded(hash: string): boolean {
    if (expandedTable[hash]) {
      return true;
    }
    return false;
  }

  setExpanded(hash: string, expanded: boolean) {
    expandedTable[hash] = expanded;
    this.utilityService.storeObject(EXPANDED_TABLE_CACHE_NAME, expandedTable);
  }
}
