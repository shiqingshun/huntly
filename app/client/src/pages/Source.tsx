import PageList from "../components/PageList";
import {useParams} from "react-router-dom";
import MainContainer from "../components/MainContainer";
import navLabels from "../components/Sidebar/NavLabels";
import {useState, useEffect} from "react";
import PageFilters, {PageFilterOptions} from "../components/PageFilters";
import {getPageListFilter} from "../domain/utils";
import { safeInt } from "../common/typeUtils";

const MyList = () => {
  const {id} = useParams<"id">();
  const sourceId = safeInt(id);
  
  const [pageFilterOptions, setPageFilterOptions] = useState<PageFilterOptions>({
    sourceId: sourceId,
    defaultSortValue: 'SAVED_AT',
    sortFields: [{
      value: 'SAVED_AT',
      label: 'Recently saved'
    }],
    asc: false,
  })

  useEffect(() => {
    setPageFilterOptions(prev => ({
      ...prev,
      sourceId: sourceId
    }));
  }, [sourceId]);

  function handleFilterChange(options: PageFilterOptions) {
    setPageFilterOptions(options);
  }

  return (
    <MainContainer>
      <PageList navLabel={navLabels.starred}
                filters={{
                  ...getPageListFilter(pageFilterOptions),
                  saveStatus: 'SAVED'
                }}
                buttonOptions={{markRead: false}}
                filterComponent={<PageFilters options={pageFilterOptions} onChange={handleFilterChange}/>}
      />
    </MainContainer>
  )
};

export default MyList;
