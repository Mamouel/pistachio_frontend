import React, { Component } from "react";
import firebase from "../scripts/firebase";
import Textarea from "react-textarea-autosize";
import { accountsRef, cookbooksRef } from "../scripts/db";
//import { Link } from 'react-router-dom';

class CreateRecipePage extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      username: props.username,
      recipe: "",
      cookbook: "",
      cookTime: "20 minutes",
      prepTime: "15 minutes",
      cookBookID: "123",
      img: "",
      ownerAnecdotes: [
        {
          0: "blabla",
          1: "bla"
        }
      ],
      ownerNotes: [
        {
          0: "blabla",
          1: "bla"
        }
      ],
      people: {
        authorID: "0",
        creatorID: "1"
      },
      starRating: "4.5",
      yieldNb: "6",
      title: {
        prettifiedPath: "al-and-mon",
        value: "Al & Mon"
      },
      tags: {
        defaultTags: [{ 0: "dessert" }],
        personalTags: [{ 0: "favourite" }]
      },
      ingredients: [
        {
          qty: "",
          unit: "",
          ingr: ""
        }
      ],
      prep: [{ step: "" }]
    };
    this.state = this.initialState;
    this.editRecipe = false;
  }

  componentDidMount() {
    //get localstorage state and set it
    console.log(this.props.location.state);
    if (this.props.location.state) {
      this.setState(this.props.location.state.recipeObject);
    } else {
      const state = JSON.parse(localStorage.getItem("state"));
      this.setState(state);
    }
  }

  setAppState = state => {
    this.setState(state, () => {
      localStorage.setItem("state", JSON.stringify(this.state));
    });
  };

  writeRecipe = async recipe => {
    const db = firebase.database();
    console.log(this.props)
    const recipeKey = this.props.location.state ? 
    this.props.location.state.recipeID :
    await db.ref("Recipes/").push().key;
    db.ref(`Recipes/${recipeKey}`).set({ ...recipe, recipeID: recipeKey });
  };

  // editRecipe = async (recipe, recipeKey) => {
  //   const db = firebase.database();
  //   await db
  //     .ref(`Recipes/${recipeKey}`)
  //     .set({ ...recipe, recipeID: recipeKey });
  // };

  addImage = async img => {
    // console.log(img)
    const storageRef = firebase.storage().ref("images/" + img.name);
    const snapshot = await storageRef.put(img);
    // console.log('Uploaded a blob or file!', snapshot);
    this.setAppState({ img: snapshot.downloadURL });
  };

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    if (value === "New Cookbook") {
      console.log("hey"); // TODO
    }

    this.setAppState({
      [name]: value
    });
  };

  handleImageInput = event => {
    this.addImage(event.target.files[0]);
  };

  formatArray = arr =>
    arr.reduce((acc, curr, index) => {
      return { ...acc, [index]: curr };
    }, {});

  handleSubmit = async event => {
    event.preventDefault();
    // alert('A recipe was submitted: ' + this.state.recipe);
    const recipe = {
      ...this.state,
      ingredients: this.formatArray(this.state.ingredients),
      prep: this.formatArray(this.state.prep)
    };

    console.log("Recipe sent");
    try {
      console.log(this.props);
      // if (!this.props.recipeID) {
        await this.writeRecipe(recipe);
      // } else {
      //   await this.editRecipe(recipe, this.props.recipeID);
      // }
      //reset state
      this.setAppState(this.initialState);
    } catch (err) {
      console.log(err);
    }
  };

  //dynamic forms from: https://goshakkk.name/array-form-inputs/

  handleIngredientChange = (idx, type) => evt => {
    const newIngredients = this.state.ingredients.map((ingredient, sidx) => {
      if (idx !== sidx) return ingredient;
      else if (type === "qty") return { ...ingredient, qty: evt.target.value };
      else if (type === "unit")
        return { ...ingredient, unit: evt.target.value };
      else if (type === "ingr")
        return { ...ingredient, ingr: evt.target.value };
      else return null;
    });

    this.setAppState({ ingredients: newIngredients });
  };

  handleAddIngredient = () => {
    this.setAppState({
      ingredients: this.state.ingredients.concat([
        { qty: "", unit: "", ingr: "" }
      ])
    });
  };

  handleRemoveIngredient = idx => () => {
    this.setAppState({
      ingredients: this.state.ingredients.filter((s, sidx) => idx !== sidx)
    });
  };

  handleStepChange = idx => evt => {
    const newStep = this.state.prep.map((step, sidx) => {
      if (idx !== sidx) return step;
      else return { ...step, step: evt.target.value };
    });

    this.setAppState({ prep: newStep });
  };

  handleAddStep = () => {
    this.setAppState({
      prep: this.state.prep.concat([{ step: "" }])
    });
  };

  handleRemoveStep = idx => () => {
    this.setAppState({
      prep: this.state.prep.filter((s, sidx) => idx !== sidx)
    });
  };

  getSelectableCookbooksList = () => {
    const defaultUnselectableOption = [<option disabled>Select A Cookbook...</option>]
    const newCookbookSelectableOption = <option value="newCookbook">Create New Cookbook...</option>

    try {
      const userID = this.props.userID;
      const selectableCookbooks = [];
      const returnTags = "";

      if (this.state.cookbookObjectsloaded) {
        this.state.userCookbooks.forEach(cookbook => {
          selectableCookbooks.push(cookbook.title.value)
        });
      }

      const selectOptions = selectableCookbooks
      .map((cookbookTitle, cbIdx) => {
        return cbIdx === 0 
        ? <option selected value={this.state.cookbookIDs[cbIdx]}>{this.state.userCookbooks[cbIdx].title.value}</option>
        : <option value={this.state.cookbookIDs[cbIdx]}>{this.state.userCookbooks[cbIdx].title.value}</option>
      })

      return defaultUnselectableOption
              .concat(selectOptions)
              .concat(newCookbookSelectableOption)

    } catch(err) { 
      return (newCookbookSelectableOption)
    }

  }

  renderSelectableCookbooks = () => {

  }

  componentWillMount = () => {
    let userCookbooksList = [];
    accountsRef
    .child(`${this.props.userID}/cookbooksList`)
    .once('value')
    .then(snap => { 
      this.setState({
        cookbookIDs: snap.val(), cookbooksListLoaded: true
      });
      userCookbooksList = snap.val(); // snap.val() = An array of strings representing the user cookbooks' IDs
      return snap.val()
    })
    .then(async returnedUserCookbookList => 
      await Promise.all(returnedUserCookbookList.map(cookbookID =>
        cookbooksRef
        .child(`${cookbookID}`)
        .once('value')
        .then(snap => snap.val()) // An array of own cookbook object(s) returned from the database.
      ))
    )
    .then((userCookbooks) => {
      this.setState({ userCookbooks, cookbookObjectsloaded: true }) 
    })
    .catch();
  }

  render() {
    this.getSelectableCookbooksList();
    console.log(this.state);
    return (
      <div id="main">
        <form onSubmit={this.handleSubmit}>
          <h2>New Recipe</h2>

          <label>
            Recipe
            <input
              name="recipe"
              type="text"
              placeholder="Recipe Name"
              value={this.state.recipe}
              onChange={this.handleInputChange}
            />
          </label>

          <label>
            Image
            <input
              name="image"
              type="file"
              // value={this.state.image}
              onChange={this.handleImageInput}
              // ref={r => this.img = r}
            />
          </label>
          {this.state.img !== "" && (
            <img src={this.state.img} alt="uploaded recipe img" />
          )}

          <label>
            Cookbook
            <select
              name="cookbook"
              type="text"
              value={this.state.cookbook}
              onChange={this.handleInputChange}
            >
              {this.getSelectableCookbooksList()}
            </select>
          </label>

          <h3>Ingredients</h3>
          {this.state.ingredients.map((ingredient, idx) => (
            <div className="ingredient">
              <input
                type="text"
                placeholder={"Quantity"}
                value={ingredient.qty}
                onChange={this.handleIngredientChange(idx, "qty")}
              />
              <select
                type="text"
                value={ingredient.unit}
                onChange={this.handleIngredientChange(idx, "unit")}
              >
                <option value="unit">Unit</option>
                <option value="Cups">Cups</option>
                <option value="Tbs">Tbs</option>
                <option value="Tsp">Tsp</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
              </select>
              <input
                type="text"
                placeholder={`Ingredient #${idx + 1}`}
                value={ingredient.ingr}
                onChange={this.handleIngredientChange(idx, "ingr")}
              />

              <button
                type="button"
                onClick={this.handleRemoveIngredient(idx)}
                className="small"
              >
                -
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={this.handleAddIngredient}
            className="small"
          >
            Add Ingredient
          </button>

          <h3>Preparation</h3>
          {this.state.prep.map((prep, idx) => (
            <div className="step">
              <Textarea
                type="text"
                placeholder={`Step #${idx + 1}`}
                value={prep.step}
                onChange={this.handleStepChange(idx)}
              />
              <button
                type="button"
                onClick={this.handleRemoveStep(idx)}
                className="small"
              >
                -
              </button>
            </div>
          ))}
          <button type="button" onClick={this.handleAddStep} className="small">
            Add Step
          </button>

          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}
export default CreateRecipePage;
