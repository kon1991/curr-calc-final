import React, {Component} from 'react';
import './App.css';
import AddConversionForm from './AddConversionForm';
import EditConversionForm from './EditConversionForm';
import DeleteConversionForm from './DeleteConversionForm';

const URL = 'http://localhost:80/curr-calc-final/public/action.php';

class App extends Component {
  constructor(props) {
    super(props);
    /*initialize the state which keeps track of:
    Which currency you are exchanging to which, the amount and the converted amount.
    also holds the conversions array which keeps track of all currencies and the available exchanges.
    exchanges are not duplex since the exercise only mentioned one way exchanges.
    */
    this.state = {
      fromValue: "Euro",
      toValue: "US Dollar",
      rate: '1.3764',
      amount: '',
      convertedAmount: '',
      showFormAdd: false,
      showFormEdit: false,
      showFormDelete: false,
      nextConversionId: 2,
      showHint: false,
      conversions: [
        {
          id:0,
          name: "Euro",
          nextConversionToId: 2,
          conversionTo:[
            {
              id: 0,
              name: "US Dollar",
              rate: 1.3764
            },
            {
              id: 1,
              name: "British Pound",
              rate: 0.8731
            }
          ]
        },
        {
          id:1,
          name: "US Dollar",
          nextConversionToid: 1,
          conversionTo: [
            {
              id: 0,
              name: "JPY",
              rate: 76.7200
            }
          ]
        }
      ]
    }
    //binding the context of the handlers
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleConvert = this.handleConvert.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleClick = this.handleClick.bind(this);
  } 
  

  handleClick(event) {
    const target = event.target;
    const value = target.value;
    if(value==="Add"){
      this.setState({showFormAdd: true, showFormDelete: false, showFormEdit: false});
    }
    if(value==="Edit"){
      this.setState({showFormAdd: false, showFormDelete: false, showFormEdit: true});
    }
    if(value==="Delete"){
      this.setState({showFormAdd: false, showFormDelete: true, showFormEdit: false});
    }
  }
  validateInput(input) {
    //fetch request to PHP script which validates the input
    //and removes special characters and whitespace to prevent cross-site scripting
    //for this to work you need a php server running at localhost:80 since I couldn't find a free host for react and php
    fetch(URL,{
      method:"POST",
      body: JSON.stringify(input),
      mode: 'cors',
      headers: {'content-type': 'application/json'}
    }).then(function(res) {
      if(!res.ok){
        throw Error("can't connect to server");
      }
      return res;
    }).then(response => response.json()).then(data => console.log(data)).catch(Error=> console.log(+Error));
  }

  handleConvert(event) {

    //Performs the currency exchange simply by getting the relevant info from state
    event.preventDefault();
    const amount = this.state.amount;
    const rate = this.state.rate;
    this.setState({convertedAmount: amount * rate});
  }

  handleAmountChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }
 
  handleInputChange(event) {
  //handleChange when changing from currency to set to curr and rate
    const target = event.target;
    const name = target.name;
    const value = target.value;

    // checks to see if its the currency to convert or the one to convert and 
    //sets the options in the select element as well as the rate of the conversion
    if(name === "fromValue"){
      for(let i=0; i<this.state.conversions.length; i++) {
        if(this.state.conversions[i].name === value){
          const fromValue = value;
          const toValue = this.state.conversions[i].conversionTo[0].name;
          const rate = this.state.conversions[i].conversionTo[0].rate;
          this.setState({fromValue: fromValue, toValue: toValue, rate: rate});
          break;
        }
      }
    }
    else if(name === "toValue") {
      const fromValue = this.state.fromValue;
      for(let i=0; i<this.state.conversions.length; i++) {
        if(this.state.conversions[i].name === fromValue){
          for(let j=0; j<this.state.conversions[i].conversionTo.length; j++){
            if(this.state.conversions[i].conversionTo[j].name === value) {
              const toValue = value;
              const rate = this.state.conversions[i].conversionTo[j].rate;
              this.setState({toValue: toValue, rate: rate});
              break;
            }
          }
        }
      }
    }
  }


  handleAdd(newConversion) {
    //spreads the newConversion object into the values we need
    const {convertFrom, convertTo, rate} = newConversion;
    //initialize variables to check whether the conversion exists, or at least if the from value does
    let convertFromFound = false;
    let convertFromIdx = null;
    let convertToFound = false;
    //create copy of state
    const conversions = this.state.conversions.slice();
    //loop through the conversion array to find if the conversion from {convertFrom} to {convertTo} exists and the index
    //in the conversion array
    for(let i=0; i<conversions.length; i++){
      if(conversions[i].name === newConversion.convertFrom){
          convertFromFound = true;
          convertFromIdx = i;
          const conversionTo = this.state.conversions[i].conversionTo;
          for(let j=0; j<conversionTo.length; j++){
            if(conversionTo[j].name === newConversion.convertTo){
              convertToFound = true;
              break;
            }
          }
      }
    }
    //check whether the conversion exists
    if(convertFromFound && convertToFound) {
      console.log("This conversion already exists!");
    }
    //if only the {convertFrom} exists, creates a new conversionTo object, appends it to the conversionTo array 
    // and then rebuilds the state object and sets it
    else if(convertFromFound) {
      this.setState((prevState)=> {
        const newConversionTo = {name: convertTo, rate: rate, id:this.state.conversions[convertFromIdx].nextConversionToId, nextConversionToId: this.state.conversions[convertFromIdx].nextConversionToId+1};
        const newConversionsTo = [...this.state.conversions[convertFromIdx].conversionTo, newConversionTo];
        const newConversion = {name: convertFrom, conversionTo: newConversionsTo, id:this.state.conversions[convertFromIdx].id, nextConversionId: this.state.nextConversionId};
        const newConversions = this.state.conversions.slice();
        newConversions[convertFromIdx] = newConversion;
        return {
          conversions: newConversions
        }
      });
    }
    //if neither of the values exists create new conversionTo object, push into a new conversionTo array
    //append it to the conversions array, increments the nextConversionIndex and sets the state
    else {
      const newConversionTo = {name:convertTo, rate: rate, id:0};
      const newConversionsTo = [newConversionTo];
      const newConversion = {name: convertFrom, conversionTo: newConversionsTo, nextConversionToId:1, id: this.state.nextConversionId};
      const newConversions = [...this.state.conversions, newConversion];
      this.setState((prevState)=> {
        return {
          conversions: newConversions,
          nextConversionId: prevState.nextConversionId + 1,
        }
      });
    }
  }

  handleEdit(editedConversion) {
    //spread the edited conversion into the need values and create a copy of the state
    const {id, convertFrom, convertTo, rate} = editedConversion;
    const conversions = this.state.conversions.slice();
    //loop through the conversion array, finds the conversion to be edited, and then builds the new state object by
    //inserting the edited conversion into the originals place
    for(let i=0; i<conversions.length; i++){
      if(conversions[i].name === convertFrom){
        const conversionsTo = this.state.conversions[i].conversionTo.slice();
        for(let j=0; j<conversionsTo.length; j++) {
          if(conversionsTo[j].name === convertTo){
            let newConversionsTo = conversionsTo.slice();
            newConversionsTo[j] = {id: id, name: convertTo, rate: rate};
            let newConversion = conversions[i];
            newConversion.conversionTo = newConversionsTo;
            let newConversions = conversions.slice();
            newConversions[i] = newConversion;
            this.setState({conversions: newConversions});
            break;
          }
        }
        break;
      }
    }
  }

  handleDelete(deletedConversion) {
    //spreads the needed values from the deletedConversionObject
    const {id, convertFrom, convertTo} = deletedConversion;
    let conversions = this.state.conversions.slice();
    //loops through conversions until it finds the one to be removed. If it's the only conversion from that particular 
    //currency then it deletes the whole conversion, then deincrements the id of every conversion after it
    for(let i=0; i<conversions.length; i++){
      if(conversions[i].name === convertFrom){
        let conversionsTo = this.state.conversions[i].conversionTo.slice();
        if(conversionsTo.length === 1){
          let newConversions = conversions.slice();
          newConversions.splice(i,1);
          for(let z=i; z<newConversions.length; z++){
            newConversions[z].id--;
          }
          let newNextConversionId = this.state.nextConversionId - 1;
          this.setState({conversions: newConversions, nextConversionId: newNextConversionId});
          break;
        }
        //if other conversions exists from the selected currency then, only remove that conversionTo from the array
        //and deincrements the ids of the other ones.
        else{
          for(let j=0; j<conversionsTo.length; j++) {
            if(conversionsTo[j].name === convertTo){
              let newConversionsTo = conversionsTo.slice();
              newConversionsTo.splice(j,1);
              for(let z=j; z<newConversionsTo.length; z++){
                newConversionsTo[z].id--;
              }
              let newConversion = conversions[i];
              newConversion.conversionTo = newConversionsTo;
              newConversion.nextConversionToId--;
              let newConversions = conversions.slice();
              newConversions[i] = newConversion;
              this.setState({conversions: newConversions});
              break;
            }
          }
        }
        
        break;
      }
    }
      /*
    escapeHtml(str){
      var map =
      {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return str.replace(/[&<>"']/g, function(m) {return map[m];});
    }*/
  }


  render() {
    //maps the available conversions from to options
    const fromOptions = this.state.conversions.map((currency, i)=>
      <option key={currency.id} id={currency.id} value={currency.name}>{currency.name}</option>
    );
    //depending on the fromValue chosen get the conversions
    let conversionOptions = this.state.conversions.slice();
    let newConversions = [];
    for(let i=0; i<conversionOptions.length; i++) {
      if(conversionOptions[i].name === this.state.fromValue){
        newConversions = conversionOptions[i].conversionTo.slice();
        break;
        
      }
    }
    //then map them to options
    const toOptions = newConversions.map((currency, i)=>
          <option key={currency.id} id={currency.id} value={currency.name}>{currency.name}</option>
        )

    //builds the options to edit and delete conversions buy iterating through the conversions array and each conversionsTO
    //array within
    let editOptions = [];
    let key = 0;
    for(let i=0; i<conversionOptions.length; i++) {
      let conversionToOptions = this.state.conversions[i].conversionTo.slice();
      let conversionFromName = this.state.conversions[i].name;
      for(let j=0; j<conversionToOptions.length; j++) {
        let conversionToName = conversionToOptions[j].name;
        let conversionRate = conversionToOptions[j].rate;
        //builds the string containing the conversions
        let name = `${conversionFromName} TO ${conversionToName}`
        let id = conversionToOptions[j].id;
        //builds the option for the select passing as its value a concatenated string containg the id,name and rate
        //seperated by commas to use in the edit/delete form
        editOptions.push(<option key={key} id={id} from={conversionFromName} to={conversionToName} value={`${id},${conversionFromName},${conversionToName},${conversionRate}`}>{name}</option>)
        key++;
      }
    }
    //pushes a final default option to the array
    editOptions.push(<option key={key} value="" selected>Select Conversion</option>)


    return(
      <div className="App">
        <button
            type="button"
            onClick={this.handleClick}
            value="Add"
          >
            Add Conversion
          </button>
          <button
            type="button"
            onClick={this.handleClick}
            value="Edit"
          >
            Edit Conversion
          </button>
          <button
            type="button"
            onClick={this.handleClick}
            value="Delete"
          >
            Delete Conversion
          </button>
        <div className="container">
          <h2>Currency Calculator</h2>
          <form onSubmit={this.handleConvert}>
            <section className="options">
            <label>From:
              <select name="fromValue" value={this.state.fromValue} onChange={this.handleInputChange}>
                {fromOptions}
              </select>
            </label>
            <label>To:
              <select name="toValue" value={this.state.toValue} onChange={this.handleInputChange}>
                {toOptions}
              </select>
            </label>
            </section>
            <input type="number" name="amount" value={this.state.value} onChange={this.handleAmountChange}/>
            <button type="submit" value="Convert">Convert</button>
          </form>
          <h1 className="converted">{this.state.convertedAmount}</h1>
        </div>
        {this.state.showFormAdd ?
            <AddConversionForm onAdd={this.handleAdd}/> :
            null }
        {this.state.showFormEdit ?
            <EditConversionForm onEdit={this.handleEdit} options={editOptions}/> :
            null }

        {this.state.showFormDelete ?
            <DeleteConversionForm onDelete={this.handleDelete} options={editOptions}/> :
            null }
      </div>
    );
  }

}
export default App;