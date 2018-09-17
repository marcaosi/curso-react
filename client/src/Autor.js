import React, {Component} from 'react'
import $ from 'jquery'
import InputCustomizado from './components/InputCustomizado.js'
import PubSub from 'pubsub-js'
import TratadorErros from './TratadorErros'

class FormularioAutor extends Component{
    constructor(){
        super()
        this.state = {nome:'', email:'', senha:''}
        this.setEmail = this.setEmail.bind(this)
        this.setNome = this.setNome.bind(this)
        this.setSenha = this.setSenha.bind(this)
    }

    setNome(event){
        this.setState({nome:event.target.value})
    }
    
    setEmail(event){
        this.setState({email:event.target.value})
    }
    
    setSenha(event){
        this.setState({senha:event.target.value})
    }
    
    enviaForm(event){
        event.preventDefault()
    
        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({nome:this.state.nome, email:this.state.email, senha:this.state.senha}),
            success: function(data) {
                PubSub.publish('atualiza-lista-autores',data)
                this.setState({nome:'', email:'', senha:''})
            }.bind(this),
            error: (err) => {
                if(err.status === 400){
                    new TratadorErros().publicaErros(err.responseJSON)
                }
            },
            beforeSend: () => {
                PubSub.publish("limpa-erros", {})
            }
        })
    }

    render(){
        return (
            <div className="pure-form pure-form-aligned">
              <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post">
                <InputCustomizado label="Nome" id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome}/>
                <InputCustomizado label="E-mail" id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail}/>
                <InputCustomizado label="Senha" id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha}/>
                <div className="pure-control-group">
                  <label></label>
                  <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                </div>
              </form>
            </div>
        )
    }
}

class TabelaAutores extends Component{

    render(){
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(autor => {
                        return (
                            <tr key={autor.id}>
                            <td>{autor.nome}</td>
                            <td>{autor.email}</td>
                            </tr>
                        )
                        })
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default class AutorBox extends Component{
    constructor(){
        super()
        this.state = {lista: []}
        this.atualizaListagem = this.atualizaListagem.bind(this)
    }
    
    componentDidMount(){
        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/autores',
            dataType: 'json',
            success: (data) => {
            this.setState({lista:data})
            }
        })

        PubSub.subscribe('atualiza-lista-autores', function (topic, novaListagem){
            this.setState({lista: novaListagem})
        }.bind(this))
    }

    atualizaListagem(novaLista){
        this.setState({lista:novaLista})
    }

    render(){
        return (
            <div>
                <FormularioAutor />
                <TabelaAutores lista={this.state.lista} />
            </div>
        )
    }
}