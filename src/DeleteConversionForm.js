import React, {Component} from 'react';

class DeleteConversionForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            id: '',
            convertFrom: '',
            convertTo: ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleConversionChange = this.handleConversionChange.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    handleConversionChange(event) {
        //splits the value of the option selected to set the state
        const conversion = event.target.value.split(',');
        this.setState({
            id: conversion[0],
            convertFrom: conversion[1],
            convertTo: conversion[2]
        })
    }

    handleSubmit(event) {
         //handle the submit, preventing default behavior, then calling the onDelete handler from app.js
        //using the spread operator on the state as the arguments
        event.preventDefault();
        this.props.onDelete({...this.state});
        //resets the state
        this.setState({
            id: '',
            convertFrom: '',
            convertTo: ''
        });
    }

    render() {
        return (
            <div className="container" onSubmit={this.handleSubmit}>
                <h2>Delete Conversion</h2>
                <form>
                    <section className="options">
                    <label>From:
                        <select name="conversions" value={this.state.fromValue} onChange={this.handleConversionChange}>
                            {this.props.options}
                        </select>
                    </label>
                    </section>
                    <input value="Delete" type="submit"></input>
                </form>
            </div>
        );
    }
}

export default DeleteConversionForm;