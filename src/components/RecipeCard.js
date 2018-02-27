import React, { Component } from "react";
import { Link } from "react-router-dom";
// import firebase from '../scripts/firebase';
import { recipesRef, accountsRef } from "../scripts/db";
import LoadingAnimation from "./LoadingAnimation";

class RecipeCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipeID: this.props.recipeID, // Change back to this later after testing: this.props.recipeID
      recipeObject: {},
    //   creatorObject: {},
      loaded: false
    };
  }

  getRecipePath = () => {
    //TODO this function will return the path of the recipe
    //Will therefore require username from state
    if (this.state.loaded) {
      try {
        return `/recipe/${this.props.recipeID}`;
      } catch (err) {
        return "/recipe";
      }
    }
    return "/recipe";
  };

  getRecipeTitle = () => {
    return this.state.recipeObject.recipe;
  };

  getRecipeImage = () => {
    return this.state.recipeObject.img;
  };

  getRecipeCreatorFullName = () => {
    // const firstName = this.state.creatorObject.firstName;
    // const lastName = this.state.creatorObject.lastName;
    // const fullName = `${firstName} ${lastName}`;
    return this.state.recipeObject.username;
  };

  componentWillMount = () => {
    let recipe = {};
    // let creatorObject = {};

    recipesRef
      .child(this.state.recipeID)
      .once("value")
      .then(snapshot => {
        recipe = snapshot.val();
        return recipe.people.creatorID;
      })
      .then(userID => {
        return accountsRef.child(userID).once("value");
      })
      .then(creatorObj => {
        this.setState({
          recipeObject: recipe,
        //   creatorObject: creatorObj.val(),
          loaded: true
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

    render() {
      //console.log(this.props)
        return (
            <div className="card">
              { !this.state.loaded 
                ? ( <LoadingAnimation/> )
                : (
                    <Link to={this.getRecipePath()}>
                      { this.state.recipeObject.img === "" 
                        ?
                        null
                        :
                        <div className="cardImg" style={{backgroundImage: `url(${this.getRecipeImage()})`}}/>}
                        <h2>{this.getRecipeTitle()}</h2>
                        {/* <p>{this.getRecipeCreatorFullName()}</p> */}
                    </Link>  
                  )
              }
            </div>
          )
      
    }
}

export default RecipeCard;
