import {PageFilterOptions} from "../components/PageFilters";
import {PageListFilter} from "../components/PageList";

export function getPageListFilter(filterOptions:PageFilterOptions) : PageListFilter{
  return {
    sort: filterOptions.defaultSortValue,
    asc: filterOptions.asc,
    sourceId: filterOptions.sourceId,
    contentFilterType: filterOptions.contentFilterType,
    startDate: filterOptions.startDate || undefined,
    endDate: filterOptions.endDate || undefined
  }
}