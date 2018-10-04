import React, {Component} from 'react'
import $ from 'jquery'
import InputCustomizado from './components/InputCustomizado'
import SelectCustomizado from './components/SelectCustomizado'
import PubSub from 'pubsub-js'
import TratadorErros from './TratadorErros'

class FormularioLivro extends Component{
    constructor(){
        super()
        this.state = {titulo:'', autorId:'', preco:''}
        this.setAutor = this.setAutor.bind(this)
        this.setTitulo = this.setTitulo.bind(this)
        this.setPreco = this.setPreco.bind(this)
    }

    setTitulo(event){
        this.setState({titulo:event.target.value})
    }

    setPreco(event){
        this.setState({preco:event.target.value})
    }

    setAutor(event){
        this.setState({autorId:event.target.value})
    }

    enviaForm(event){
        event.preventDefault()

        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({titulo:this.state.titulo, preco:this.state.preco, autorId:this.state.autorId}),
            success: function(data) {
                PubSub.publish('atualiza-lista-livros',data)
                this.setState({titulo:'', preco:'', autorId:''})
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
                <InputCustomizado label="Título" id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo}/>
                <InputCustomizado label="Preço" id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco}/>
                <SelectCustomizado label="Autor" id="autor" type="text" name="autor" value={this.state.autorId} onChange={this.setAutor} autores={this.props.autores}/>
                {/* <select value={this.state.autorId} name="autorId" onChange={this.setAutor} >
                    <option value="">Selecione</option>
                    {
                        this.props.autores.map(function(autor){
                            return <option key={autor.id} value={autor.id}>{autor.nome}</option>
                        })
                    }
                </select> */}
                <div className="pure-control-group">
                  <label></label>
                  <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                </div>
              </form>
            </div>
        )
    }
}

class TabelaLivros extends Component{

    render(){
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Título</th>
                        <th>Preço</th>
                        <th>Autor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(livro => {
                        return (
                            <tr key={livro.id}>
                            <td>{livro.titulo}</td>
                            <td>{livro.preco}</td>
                            <td>{livro.autor.nome}</td>
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

export default class LivroBox extends Component{
    constructor(){
        super()
        this.state = {lista: [], autores: []}
    }

    componentDidMount(){
        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/livros',
            dataType: 'json',
            success: (data) => {
                this.setState({lista:data})
            }
        })

        $.ajax({
            url: 'http://cdc-react.herokuapp.com/api/autores',
            dataType: 'json',
            success: (data) => {
                this.setState({autores:data})
            }
        })

        PubSub.subscribe('atualiza-lista-livros', function (topic, novaListagem){
            this.setState({lista: novaListagem})
        }.bind(this))
    }

    render(){
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivros lista={this.state.lista} />
                </div>
            </div>
        )
    }
}