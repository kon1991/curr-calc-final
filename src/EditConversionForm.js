import React, {Component} from 'react';

class EditConversionForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            id: '',
            convertFrom: '',
            convertTo: '',
            rate: ''
        }
        this.handleConversionChange = this.handleConversionChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleConversionChange(event) {
        //splits the value of the option selected to set the states
        const conversion = event.target.value.split(',');
        this.setState({
            id: conversion[0],
            convertFrom: conversion[1],
            convertTo: conversion[2],
            rate: conversion[3]
        })
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    

    handleSubmit(event) {
        event.preventDefault();
        if(this.state.convertFrom!==undefined) {
            this.props.onEdit({...this.state});
            this.setState({
                convertFrom: '',
                convertTo: '',
                rate: '',
                id: ''
            });                                                                             

        }
        
    }

    render() {
        return (
            <div className="container" onSubmit={this.handleSubmit}>
                <h2>Edit Conversion</h2>
                <form>
                    <section className="options">
                    <label>Conversion:
                        <select name="conversions" value={this.state.fromValue} onChange={this.handleConversionChange}>
                            {this.props.options}
                        </select>
                    </label>
                    </section>
                    <label>Rate:
                        <input name="rate" type="text" value={this.state.rate} onChange={this.handleChange}></input>
                    </label>
                    <input type="submit" value="Submit"></input>
                </form>
            </div>
        );
    }
}

export default EditConversionForm;