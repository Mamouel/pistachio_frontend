import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from './RecipeCard';
// import { firebase } from '../scripts/firebase';
import { cookbooksRef, usersRef } from '../scripts/db';
import LoadingAnimation from './LoadingAnimation';

class Cookbook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cookbookID: this.props.cookbookID, // Once completed, set back to: this.props.cookbookID
            cookbookObject: {},
            creatorObject: {}, // Required Anywhere ? Remove Later If Not
            cookbookTitle: null,
            recipeIDs: [],
            loaded: false
        }
    }

    componentWillMount = async () => {
        // console.log(this.state.cookbookID)
      let cookbook = {};
      let cookbookRecipeIDs;
      let cookbookTtl;

      await cookbooksRef
      .child(this.state.cookbookID)
      .once("value")
      .then(snapshot => {
          cookbook = snapshot.val();
        //   console.log(cookbook)
          cookbookTtl = cookbook.title.value;
          cookbookRecipeIDs = cookbook.recipeIDs;
          return cookbook.ownerUserID;
      })
      .then(ownerUserID => {
          return usersRef
          .child(ownerUserID)
          .once("value")
      })
      .then(creatorObj => {
          this.setState({
              cookbookObject: cookbook,
              cookbookTitle: cookbookTtl,
              creatorObject: creatorObj.val(),
              recipeIDs: cookbookRecipeIDs,
              loaded: true
          })
      })
      .catch(err => { console.log("COOKBOOK.JS > COMPONENTWILLMOUNT ERROR =", err) } );
  }

    getClassName = () => {
        return `flexContain cookBookContainer ${this.props.isHidden ? "isHidden" : ""}`;
    }

    renderAllRecipe = () => {
        if (this.state.recipeIDs === undefined) return null;
        return (
        this.state.recipeIDs.map((recipeID, idx) => (
            <RecipeCard 
            key={idx}
            recipeID={recipeID}
            username={this.props.username}
            userID={this.props.userID}
            />
        ))
        )
      }

    render() {
        // console.log(this.state.cookbookID)
        console.log("This state recipe IDs = " + this.state.recipeIDs)
      return !this.state.loaded
      ? 
      <LoadingAnimation/>
      :
      ( <div className={this.getClassName()}>
          <header>
              <h1>{this.state.cookbookTitle}</h1>
              { this.state.recipeIDs === undefined || this.state.recipeIDs.length <= 0 ?
                <h3>You have no recipe in this cookbook yet 
                    <Link to="/edit" className="addRecipe">
                        <i className="icon addBlack i18" />Add a recipe
                    </Link>
                </h3>
                
                : null
              }
          </header>
          <div className="cardContain">
              {this.renderAllRecipe()}
          </div>
      </div> )
    }
  }

  export default Cookbook;
