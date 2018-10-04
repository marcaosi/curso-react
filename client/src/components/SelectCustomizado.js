import React, {Component} from 'react'
import PubSub from 'pubsub-js'

export default class SelectCustomizado extends Component{

    constructor(){
        super()
        this.state = {msgErro:''}
    }

    render(){
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                {/* <input id={this.props.id} type={this.props.type} name={this.props.name} value={this.props.value} onChange={this.props.onChange} /> */}
                
                <select value={this.state.autorId} name={this.props.name} onChange={this.props.onChange} >
                    <option value="">Selecione</option>
                    {
                        this.props.autores.map(function(item){
                            return <option key={item.id} value={item.id}>{item.nome}</option>
                        })
                    }
                </select>
                <span className="error">{this.state.msgErro}</span>
            </div>
        )
    }

    componentDidMount(){
        PubSub.subscribe("erro-validacao", function(topic, erro){
            if(erro.field === this.props.name)
            this.setState({msgErro: erro.defaultMessage})
        }.bind(this))

        PubSub.subscribe("limpa-erros", function(topic) {
            this.setState({msgErro:''})
        }.bind(this))
    }
}