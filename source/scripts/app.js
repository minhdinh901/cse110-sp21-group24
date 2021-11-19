import { Router } from "./router.js";
import { SpoonacularInterface } from "./spoonacular-interface.js";
import { IndexedDbInterface } from "./indexed-db-interface.js";

const EXPLORE_PAGE_NUM_RESULTS = 6;
const HOME_PAGE_NUM_RESULTS = 4;
let COOKBOOK_TO_EDIT = null;
const router = new Router("home-page");
const spoonacular = new SpoonacularInterface();
const indexedDb = new IndexedDbInterface();

/**
 * Creates a recipe card element
 * @returns A recipe card element
 */
function createRecipeCard() {
  "use strict";
  const recipeCard = document.createElement("recipe-card");
  recipeCard.classList.add("make-invisible");
  return recipeCard;
}

/**
 * This function toggles whether the explore page will display recipes based on a filter or
 * by random.
 */
function toggleExplorePageType() {
  "use strict";
  let shadow = document.querySelector("explore-page").shadowRoot;
  let topLevel = shadow.getElementById("explore-top-level");
  let loadButton = shadow.getElementById("load-button");
  topLevel.classList.toggle("type-explore");

  if (topLevel.classList.contains("type-explore")) {
    loadButton.textContent = "Explore More";
  } else {
    loadButton.textContent = "Explore Recipes";
  }
}

/**
 * Populates new recipes in the Explore page by retrieving new recipes from
 * Spoonacular
 * @function populateExplorePage
 */
async function populateExplorePage(filtersObj) {
  "use strict";
  let shadow = document.querySelector("explore-page").shadowRoot;
  let topLevel = shadow.getElementById("explore-top-level");

  let recipes = {};
  if (topLevel.classList.contains("type-explore")) {
    recipes = await spoonacular.getRandomRecipes(EXPLORE_PAGE_NUM_RESULTS);
  } else {
    recipes = await spoonacular.getRecipes(filtersObj);
  }
  shadow.getElementById("no-results-text").classList.add("make-invisible");
  let recipeCards = shadow.getElementById("recipe-cards-section").children;

  for (let i = 0; i < recipes.length; ++i) {
    recipeCards[i].classList.remove("make-invisible");
    let cardShadow = recipeCards[i].shadowRoot;
    cardShadow.getElementById("recipe-id").textContent = recipes[i].id;
    cardShadow.getElementById("recipe-card-title").textContent =
      recipes[i].title;
    cardShadow.getElementById("recipe-card-image").src = recipes[i].image;
  }
}

/**
 * Creates a cookbook element and adds it to the document
 * @function createCookbook
 */
function createCookbook() {
  "use strict";
  const cookbook = document.createElement("cook-book");
  cookbook.classList.toggle("hidden");
  document.querySelector("body").append(cookbook);
}

/**
 * Binds the Create Cookbook button in the Create Cookbook form to save
 * cookbooks to local storage
 * @function bindCreateCookbookSave
 */
function bindCreateCookbookSave() {
  "use strict";
  let shadow = document.querySelector("create-cookbook").shadowRoot;
  let buttonHandler = shadow.getElementById("save-button");
  buttonHandler.addEventListener("click", async () => {
    let title = shadow.getElementById("title-input").value;

    if (title !== "") {
      let description = shadow.getElementById("description-input").value;
      await indexedDb.createCookbook(title, description);
      router.navigate("cook-book");
    }
  });
}

/**
 * Creates a form for creating a new cookbook and adds it to the document
 * @function createCreateCookbook
 */
function createCreateCookbook() {
  "use strict";
  const createCookbook = document.createElement("create-cookbook");
  createCookbook.classList.toggle("hidden");
  document.querySelector("body").append(createCookbook);
}

/**
 * Creates a form for editing a cookbook and adds it to the document
 * @function createEditCookbook
 */
function createEditCookbook() {
  "use strict";
  const editCookbook = document.createElement("edit-cookbook");
  editCookbook.classList.toggle("hidden");
  document.querySelector("body").append(editCookbook);
}

/**
 * Creates the explore page and adds it to the document
 * @function createExplorePage
 */
function createExplorePage() {
  "use strict";
  const explorePage = document.createElement("explore-page");
  explorePage.classList.toggle("hidden");
  const recipeCardsSection = explorePage.shadowRoot.getElementById(
    "recipe-cards-section"
  );

  for (let i = 0; i < EXPLORE_PAGE_NUM_RESULTS; ++i) {
    const recipeCard = createRecipeCard();
    recipeCardsSection.append(recipeCard);
  }

  document.querySelector("body").append(explorePage);
}

/**
 * @function bindExploreSearchBar
 *
 * This function binds the search bar in the explore page so
 * that you can enter queries and get results based on the user input.
 *
 */
function bindExploreSearchBar() {
  "use strict";
  //Get references to search bar on explore
  let explorePage = document.querySelector("explore-page");
  let shadow = explorePage.shadowRoot;

  //Get references to filter checkboxes
  let input = shadow.getElementById("search-bar");
  let vegan = shadow.getElementById("vegan");
  let glutenFree = shadow.getElementById("gluten-free");
  let vegetarian = shadow.getElementById("vegetarian");
  /**
   * Can add more above for more hardcoded filters!
   */

  //Attaches KeyUp bind for the enter key
  input.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        //If there are queries (checkbox or text)
        input.value !== "" ||
        vegan.checked ||
        glutenFree.checked ||
        vegetarian.checked
      ) {
        if (
          //Toggle off explore type
          shadow
            .getElementById("explore-top-level")
            .classList.contains("type-explore")
        ) {
          toggleExplorePageType();
        }
        //Create query object for parameter to API call
        let queryObj = {};
        queryObj.query = input.value; //Set query value to text
        queryObj.diet = "";
        //Add checkboxes to diet
        if (vegan.checked) {
          queryObj.diet += "vegan ";
        }
        if (glutenFree.checked) {
          queryObj.diet += "gluten free ";
        }
        if (vegetarian.checked) {
          queryObj.diet += "vegetarian ";
        }
        await populateExplorePage(queryObj); //API call with queries
      } else {
        //Otherwise, if there are no queries,
        if (
          //Toggle the explore type
          !shadow
            .getElementById("explore-top-level")
            .classList.contains("type-explore")
        ) {
          toggleExplorePageType();
        }
        await populateExplorePage(); //Call API with random recipes
      }
    }
  });
}

/**
 * Creates a wave custom element and adds it to the document
 * @function createFooterImg
 */
function createFooterImg() {
  "use strict";
  const footerImg = document.createElement("footer-img");
  document.querySelector("body").append(footerImg);
}

/**
 * Creates a home page element and adds it to the document
 * @function createHomePage
 */
function createHomePage() {
  "use strict";
  const homePage = document.createElement("home-page");
  document.querySelector("body").append(homePage);
}

/**
 * Creates a navbar custom element and adds it to the document
 * @function
 */
function createNavbar() {
  "use strict";
  const navbar = document.createElement("custom-navbar");
  document.querySelector("body").append(navbar);
}

/**
 * Creates the recipe added notification and adds it to the document
 * @function createNotificationRecipeAdded
 */
function createNotificationRecipeAdded() {
  "use strict";
  const notification = document.createElement("notification-recipe-added");
  notification.classList.toggle("hidden");
  document.querySelector("body").append(notification);
}

/**
 * Creates the recipe deleted notification and adds it to the document
 * @function createNotificationRecipeDeleted
 */
function createNotificationRecipeDeleted() {
  "use strict";
  const notification = document.createElement("notification-recipe-deleted");
  notification.classList.toggle("hidden");
  document.querySelector("body").append(notification);
}

/**
 * Creates the select cookbook notification and adds it to the document
 * @function createNotificationSelectCookbook
 */
function createNotificationSelectCookbook() {
  "use strict";
  const notification = document.createElement("notification-select-cookbook");
  notification.classList.toggle("hidden");
  document.querySelector("body").append(notification);
}

/**
 * Creates the form for editing a recipe and adds it to the document
 * @function createRecipeForm
 */
function createRecipeForm() {
  "use strict";
  const recipeForm = document.createElement("recipe-form");
  recipeForm.classList.toggle("hidden");
  document.querySelector("body").append(recipeForm);
}

/**
 * Creates the recipe page and adds it to the document
 * @function createRecipePage
 */
function createRecipePage() {
  "use strict";
  const recipePage = document.createElement("recipe-page");
  recipePage.classList.toggle("hidden");
  document.querySelector("body").append(recipePage);
}

/**
 * Creates the single cookbook page and adds it to the document
 * @function createSingleCookbook
 */
function createSingleCookbook() {
  "use strict";
  const singleCookbook = document.createElement("single-cookbook");
  singleCookbook.classList.toggle("hidden");
  document.querySelector("body").append(singleCookbook);
}

/**
 * Attaches "click" event listeners to the buttons on the navbar
 * that navigate to the correct page when clicked.
 */
function connectNavbarButtons() {
  "use strict";

  //Get references to buttons in shadowRoot
  let navbar = document.querySelector("custom-navbar");
  let shadow = navbar.shadowRoot;
  let buttons = shadow.querySelectorAll("button.navbar-tab");

  //Loop through buttons and establish click listeners on each button
  for (let i = 0; i < buttons.length; i++) {
    //Use if statements to check for name for easy style changes in the future
    if (buttons[i].textContent === "Home") {
      buttons[i].addEventListener("click", () => {
        router.navigate("home-page");
      });
    }

    if (buttons[i].textContent === "Explore") {
      buttons[i].addEventListener("click", () => {
        router.navigate("explore-page"); // Navigate to explore page
      });
    }

    if (buttons[i].textContent === "My Cookbooks") {
      buttons[i].addEventListener("click", () => {
        router.navigate("cook-book");
      });
    }
  }
}

/**
 * Allows new recipes to be populated in the Explore when pressing the Explore
 * More or Explore Recipes buttons in the Explore page
 * @function bindExploreLoadButton
 */
function bindExploreLoadButton() {
  "use strict";
  let shadow = document.querySelector("explore-page").shadowRoot;
  let topLevel = shadow.getElementById("explore-top-level");
  let loadButton = shadow.getElementById("load-button");

  let vegan = shadow.getElementById("vegan");
  let glutenFree = shadow.getElementById("gluten-free");
  let vegetarian = shadow.getElementById("vegetarian");
  let input = shadow.getElementById("search-bar");

  loadButton.addEventListener("click", async () => {
    if (
      topLevel.classList.contains("type-explore") &&
      input.value === "" &&
      !vegan.checked &&
      !glutenFree.checked &&
      !vegetarian.checked
    ) {
      await populateExplorePage();
    } else {
      if (
        input.value === "" &&
        !vegan.checked &&
        !glutenFree.checked &&
        !vegetarian.checked
      ) {
        toggleExplorePageType();
        await populateExplorePage();
      } else {
        if (topLevel.classList.contains("type-explore")) {
          toggleExplorePageType();
        }
        let queryObj = {};
        queryObj.query = input.value;
        queryObj.diet = "";
        if (vegan.checked) {
          queryObj.diet += "vegan ";
        }
        if (glutenFree.checked) {
          queryObj.diet += "gluten free ";
        }
        if (vegetarian.checked) {
          queryObj.diet += "vegetarian ";
        }
        await populateExplorePage(queryObj);
      }
    }
  });
}

/**
 * Navigate to explore page if "Explore" button is clicked
 *
 * @function homeExploreButton
 */
function homeExploreButton() {
  "use strict";

  //Get references to explore button on homepge
  let home = document.querySelector("home-page");
  let shadow = home.shadowRoot;
  let explore = shadow.querySelector("button.explore-button");

  explore.addEventListener("click", () => {
    router.navigate("explore-page");
  });
}

/**
 * Navigate to explore page if "Explore" button is clicked
 *
 */
function homeSearchFunction() {
  "use strict";

  //Get references to search bar on homepage
  let home = document.querySelector("home-page");
  let shadow = home.shadowRoot;
  let input = shadow.getElementById("recipeSearch");

  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // store search string and navigate to explore page
      // let searchQuery = e.target.value;
      router.navigate("explore-page");

      // TODO more here once explore page setup
    }
  });
}

/**
 * Populates new recipes in the home page by retrieving new recipes from
 * Spoonacular
 * @function populateHomePage
 */
async function populateHomePage() {
  "use strict";
  let shadow = document.querySelector("home-page").shadowRoot;
  const explore = shadow.getElementById("explore");

  for (let i = 0; i < HOME_PAGE_NUM_RESULTS; ++i) {
    const recipeCard = document.createElement("recipe-card");
    explore.append(recipeCard);
  }

  let recipes = await spoonacular.getRandomRecipes(HOME_PAGE_NUM_RESULTS);
  let recipeCards = explore.children;

  for (let i = 0; i < HOME_PAGE_NUM_RESULTS; ++i) {
    let shadow = recipeCards[i].shadowRoot;
    shadow.getElementById("recipe-id").textContent = recipes[i].id;
    shadow.getElementById("recipe-card-title").textContent = recipes[i].title;
    shadow.getElementById("recipe-card-image").src = recipes[i].image;
  }
}

/**
 * Attaches "click" event listeners to the Create New Cookbook
 * button on My Cookbook page which will navigate to Create Cookbook page.
 */
function connectCreateNewCookbook() {
  "use strict";

  //Get references to createButtons
  let templatePage = document.querySelector("cook-book");
  let shadow = templatePage.shadowRoot;
  let button = shadow.querySelector("button");

  button.addEventListener("click", () => {
    router.navigate("create-cookbook");
  });
}

/**
 * Populate the recipe page with all the necessary recipe information
 * @function populateRecipePage
 * @param {object} recipeObj An object containing all the necessary properties
 *                           that would show up in the recipe page
 * @param {boolean} fromSpoonacular If fromSpoonacular is true, then the
 *                                  recipeObj came from Spoonacular, otherwise,
 *                                  it will be inferred that the recipeObj came
 *                                  from another source besides Spoonacular
 */
function populateRecipePage(recipeObj, fromSpoonacular) {
  "use strict";
  let shadow = document.querySelector("recipe-page").shadowRoot;

  if (fromSpoonacular) {
    shadow.getElementById("recipe-page-id").textContent = recipeObj.id;
  }

  shadow.getElementById("recipe-title").textContent = recipeObj.title;
  shadow.getElementById("recipe-author").textContent =
    "Recipe by: " + recipeObj.author;

  let cuisineTag = shadow.getElementById("recipe-cuisine");

  switch (recipeObj.cuisines.length) {
    case 0:
      cuisineTag.classList.add("hide-recipe-part");
      break;
    case 1:
      cuisineTag.textContent = "Cuisine: " + recipeObj.cuisines[0];
      break;
    default:
      cuisineTag.textContent =
        "Cuisines: " + recipeObj.cuisines[0] + ", " + recipeObj.cuisines[1];
  }

  if (recipeObj.readyInMinutes === 0) {
    shadow.getElementById("recipe-ready-in").classList.add("hide-recipe-part");
  } else {
    shadow.getElementById("recipe-ready-in").textContent =
      "Ready In: " + recipeObj.readyInMinutes + " min";
  }

  let actionPlus = shadow.getElementById("recipe-action-image-plus");
  let actionPencil = shadow.getElementById("recipe-action-image-pencil");
  let actionText = shadow.getElementById("recipe-action-text");

  if (fromSpoonacular) {
    actionPlus.classList.remove("hide-recipe-part");
    actionPencil.classList.add("hide-recipe-part");
    actionText.textContent = "Add to Cookbook";
  } else {
    actionPlus.classList.add("hide-recipe-part");
    actionPencil.classList.remove("hide-recipe-part");
    actionText.textContent = "Edit Recipe";
  }

  shadow.getElementById("recipe-image").src = recipeObj.image;
  shadow.getElementById("recipe-description").textContent =
    recipeObj.description;

  let ingredientsLeft = shadow.getElementById(
    "recipe-ingredients-section-left"
  );
  let ingredientsRight = shadow.getElementById(
    "recipe-ingredients-section-right"
  );

  while (ingredientsLeft.firstChild) {
    ingredientsLeft.removeChild(ingredientsLeft.lastChild);
  }

  while (ingredientsRight.firstChild) {
    ingredientsRight.removeChild(ingredientsRight.lastChild);
  }

  for (let i = 0; i < recipeObj.ingredients.length; ++i) {
    let ingredient = document.createElement("li");
    ingredient.classList.add("ingredient-item");
    ingredient.textContent = recipeObj.ingredients[i];

    if (i % 2 === 0) {
      ingredientsLeft.append(ingredient);
    } else {
      ingredientsRight.append(ingredient);
    }
  }

  let instructionsList = shadow.getElementById("instructions-list");

  while (instructionsList.firstChild) {
    instructionsList.removeChild(instructionsList.lastChild);
  }

  for (let i = 0; i < recipeObj.instructions.length; ++i) {
    let instruction = document.createElement("li");
    instruction.classList.add("instruction-item");
    instruction.textContent = recipeObj.instructions[i];
    instructionsList.append(instruction);
  }
}

/**
 * Populate the my cookbooks page with cookbook cards
 * @function populateCookbooksPage
 */
async function populateCookbooksPage() {
  "use strict";

  // get reference to cookbook page and the card section
  let shadow = document.querySelector("cook-book").shadowRoot;
  let cardContainer = shadow.getElementById("cards");

  // clear any existing cards
  cardContainer.innerHTML = "";

  // get cookbooks from db
  let cookbooks = await indexedDb.getAllCookbooks();

  // add each cookbook to the page as a new card
  for (const cookbook of cookbooks) {
    let card = document.createElement("cookbook-card");
    card.cookbook = cookbook;
    bindCookbookCardButtons(card);

    cardContainer.appendChild(card);
  }
}

/**
 * Attaches event listeners to the buttons within a given cookbook card
 * @function bindCookbookCardButtons
 * @param {object} card The cookbook card element
 */
function bindCookbookCardButtons(card) {
  "use strict";

  // get references to the buttons in the card
  let shadow = card.shadowRoot;
  let title = shadow.querySelector(".title").innerHTML;
  let editButton = shadow.getElementById("edit");
  let removeButton = shadow.getElementById("remove");
  let openButton = shadow.getElementById("open");

  editButton.addEventListener("click", () => {
    // TODO set up cookbook editing
    // Updates the CURRENT_COOKBOOK_TITLE
    COOKBOOK_TO_EDIT = title;
    router.navigate("edit-cookbook");
  });

  removeButton.addEventListener("click", async () => {
    // delete cookbook, then repopulate page
    await indexedDb.deleteCookbook(card.cookbook.title);
    populateCookbooksPage();
  });

  openButton.addEventListener("click", () => {
    // TODO set up cookbook page
    router.navigate("single-cookbook");
  });
}

// TODO trigger this function when cookbooks are added, edited, or deleted
/**
 * Populates the Select Cookbook notification options with all of the user's
 * cookbooks
 * @function populateSelectCookbookOptions
 */
async function populateSelectCookbookOptions() {
  "use strict";
  let notificationSelectCookbook = document.querySelector(
    "notification-select-cookbook"
  );
  let shadow = notificationSelectCookbook.shadowRoot;
  let cookbookDropdown = shadow.getElementById("cookbooks");

  while (cookbookDropdown.children[1]) {
    cookbookDropdown.removeChild(cookbookDropdown.lastChild);
  }

  let cookbooks = await indexedDb.getAllCookbooks();

  for (let i = 0; i < cookbooks.length; ++i) {
    let option = document.createElement("option");
    option.value = cookbooks[i].title;
    option.textContent = cookbooks[i].title;
    cookbookDropdown.append(option);
  }
}

/**
 * In the Select Cookbooks popup, this function binds the X button to close
 * the popup and binds the Add button to save the currently opened recipe to
 * the selected cookbook
 * @function bindSelectCookbookButtons
 */
function bindSelectCookbookButtons() {
  "use strict";
  let notificationSelectCookbook = document.querySelector(
    "notification-select-cookbook"
  );
  let shadow = notificationSelectCookbook.shadowRoot;

  let addButton = shadow.getElementById("add-button");

  addButton.addEventListener("click", async () => {
    let recipePage = document.querySelector("recipe-page");
    let selectedCookbook = shadow.getElementById("cookbooks").value;

    if (selectedCookbook !== "" && !recipePage.classList.contains("hidden")) {
      let recipeId =
        recipePage.shadowRoot.getElementById("recipe-page-id").textContent;
      let recipeObj = await spoonacular.getRecipeInfo(recipeId);
      await indexedDb.addRecipe(selectedCookbook, recipeObj);
      notificationSelectCookbook.classList.toggle("hidden");
    }
  });

  let closeButton = shadow.getElementById("close");

  closeButton.addEventListener("click", () => {
    notificationSelectCookbook.classList.toggle("hidden");
  });
}

/**
 * Attaches "click" event listener to the Edit Recipe/Add to Cookbook
 * button on the recipe page, which will either open the recipe edit form,
 * or the cookbook select pop up
 * @function connectRecipeAction
 */
function connectRecipeAction() {
  "use strict";

  // get references to button and text
  let templatePage = document.querySelector("recipe-page");
  let shadow = templatePage.shadowRoot;
  let button = shadow.getElementById("recipe-action-button");
  let text = shadow.getElementById("recipe-action-text");

  button.addEventListener("click", () => {
    // get text string
    let string = text.textContent;

    // open edit page or cookbook selector, respectively
    if (string === "Edit Recipe") {
      // TODO pass recipe object to edit page
      router.navigate("recipe-form");
    } else {
      let notification = document.querySelector("notification-select-cookbook");
      notification.classList.toggle("hidden");
    }
  });
}

/**
 * Adds an event listener to the "Save Changes" button in the "Edit Cookbook"
 * page.
 * @param {String} oldTitle 
 */
function buttonsEditCookbook() {
  // Get the "Save Changes" button
  let templatePage = document.querySelector("edit-cookbook");
  let shadow = templatePage.shadowRoot;
  let saveButton = shadow.querySelector("div").children[3]
    .getElementsByTagName("button")[0];

  let cancelButton = shadow.querySelector("div").children[2]
    .getElementsByTagName("button")[0];

  saveButton.addEventListener("click", async () => {
    // Get the Title and the Description
    let templatePage = document.querySelector("edit-cookbook");
    let shadow = templatePage.shadowRoot;
    let mainDiv = shadow.querySelector("div.input-container");

    // Gets the div by index (first div = 0, second div = 1)
    let title = mainDiv.children[0].getElementsByTagName("input")[0].value;
    let description = mainDiv.children[1].getElementsByTagName("input")[0].value;

    if (title == null || title == ""
      || description == null || description == "") {
      alert("Plese enter a valid Title and/or Description");
    }
    else {
      // Place into storage
      await indexedDb.editCookbook(COOKBOOK_TO_EDIT, title, description);

      // Update the cookbooks
      await populateSelectCookbookOptions();

      // Set the textbox fields to original format
      mainDiv.children[0].getElementsByTagName("input")[0].value = null;
      mainDiv.children[1].getElementsByTagName("input")[0].value = null;

      // Go back to cookbook page
      router.navigate("cook-book");
    }

    cancelButton.addEventListener("click", () => {
      router.navigate("cook-book");
    });
  });
}

/**
 * Runs initial setup functions when the page first loads
 * @function init
 */
async function init() {
  "use strict";

  await indexedDb.openDb();

  createNavbar();
  createHomePage();
  createExplorePage();
  populateExplorePage();
  bindExploreLoadButton();
  populateHomePage();

  createCookbook();
  createFooterImg();

  //   createCookbookCard();
  createCreateCookbook();
  createEditCookbook();
  createNotificationRecipeAdded();
  createNotificationRecipeDeleted();
  createNotificationSelectCookbook();
  createRecipeForm();
  createRecipePage();
  createSingleCookbook();
  bindCreateCookbookSave();

  connectNavbarButtons();

  homeSearchFunction();
  homeExploreButton();
  connectCreateNewCookbook();
  bindExploreSearchBar();
  connectRecipeAction();
  buttonsEditCookbook();

  populateSelectCookbookOptions();
  bindSelectCookbookButtons();

  // TODO remove the below lines when we actually start using
  // populateRecipePage() for a real purpose
  let recipeObj = {
    title: "title",
    author: "author",
    cuisines: ["cuisine-0", "cuisine-1"],
    readyInMinutes: 10,
    image: "/source/images/pasta.jpg",
    description: "description",
    ingredients: ["ingredient-1", "ingredient-2"],
    instructions: ["instruction-1", "instruction-2"],
  };
  populateRecipePage(recipeObj, true);

  populateCookbooksPage();
  // TODO
}

window.addEventListener("DOMContentLoaded", init);
