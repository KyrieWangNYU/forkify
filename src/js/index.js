// Global app controller
import Search from './models/Search';
import {elements} from "./views/base";
import * as searchView from './views/searchView';

const state = {};

const controlSearch = async () => {
    //1.get the query from view
    const query = searchView.getInput();

    if (query){
        //2. new search object and add to state
        state.search = new Search(query);

        //3.Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();

        //4.Search for recipes
        await state.search.getResults();

        //5.render the result on UI
        searchView.renderResults(state.search.result);

    }

};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


