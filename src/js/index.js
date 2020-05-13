// Global app controller
import {elements, renderLoader, clearLoader} from "./views/base";
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import Search from './models/Search';

const state = {};
window.state = state;


/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    //1.get the query from view
    const query = searchView.getInput();

    if (query){
        //2. new search object and add to state
        state.search = new Search(query);

        //3.Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            //4.Search for recipes
            await state.search.getResults();

            //5.render the result on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch (err){
            alert('Something wrong with the search');
            clearLoader();
        }
    }

};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {

    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {


    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search)
            searchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);


        try {
            //Get recipe data and parse ingredient
            await state.recipe.getRecipe();
            state.recipe.parseIngredient();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch(err){
            alert('Error processing recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/**
LIST CONTROLLER
 */

const controlList = () => {
    //Create a new list if there is none yet
    if (!state.list){
        state.list = new List();
    }

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

};


//Handle delete and update list event
elements.shopping.addEventListener('click', e => {
   const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle delete button event
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete it from state
        state.list.deleteItem(id);

        //Delete it from UI
        listView.deleteItem(id);
    }else if (e.target.matches('.shopping__count-value')){
        //Handle count update
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/**
 * LIKE CONTROLLER
 */
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () =>{
    if (!state.likes){
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;

    //User has not yet like current recipe
    if (!state.likes.isLiked(currentID)){
        //Add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle the like button
        likesView.toggleLikeButton(true);

        //Add like to UI list
        likesView.renderLike(newLike);

    }else{//User has liked the current recipe


        //remove like to state
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likesView.toggleLikeButton(false);

        //remove like to UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //Add ingredient to shopping list
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }

});


window.l = new List();

