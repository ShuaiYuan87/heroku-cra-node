import React, { Component } from 'react';
import './App.css';
import Player from './player.js';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
} from 'react-router-dom'

import Chathead from './chatHead.js'
import ChatPane from './chatPane.js'
import io from 'socket.io-client'

var UNIVERSE = 100000;
var rid = Math.floor(Math.random() * UNIVERSE);
var defaultRoomID = 'room' + Math.floor(Math.random() * UNIVERSE);
// var serverIP = '73.231.32.235';
var serverIP = 'localhost';
// var serverIP = '192.168.10.180';
// var serverIP = 'boiling-savannah-79551.herokuapp.com';
//var port = '80';
var port = '8989';
var socket = io('http://' + serverIP + ':' + port);
// const fs = require('fs');
// const socket = require('socket.io-client')('https://localhost:3000', {
//   rejectUnauthorized: true, // default value
//   ca: fs.readFileSync('./cert.pem')
// });
console.log(socket)
var init = false;

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#root');

export class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
      url: "https://www.youtube.com/watch?v=oUFJJNQGwhk",
      text: '',
      chatheads: [],
      roomURL: "",
      player: null
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setURL = this.setURL.bind(this);
    this._add = this._add.bind(this);
    this._addMessage = this._addMessage.bind(this);
    this.myRef = React.createRef();
  }

  openModal(u, roomID, player) {
    this.setState({modalIsOpen: true});
    this.setState({url: u});
    this.setState({roomURL: "/" + roomID});
    console.log("openModal")
    console.log(player)
    this.setState({player: player});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  setURL(u) {
    this.setState({url: u});
  }

  doNothing() {

  }

  _add(event) {
    if(event.keyCode === 13){
      this._addMessage(this.state.text);
      this.setState({text: ''});
    }
  }

  _addMessage(message: string) {
    var chatheads = this.state.chatheads;
    chatheads.push(
      <Chathead text={message} />
    );
    this.setState({
      chatheads: chatheads,
    });
  }

  componentDidMount() {



  }

  render() {
    return (
      <Router>

        <div className='App'>

          <div>
            <Modal
              isOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              onRequestClose={this.closeModal}
              style={customStyles}
              contentLabel="Example Modal"
            >

              <h2 ref={subtitle => this.subtitle = subtitle}>Hello</h2>
              <button onClick={this.closeModal}>
                <Link to={this.state.roomURL}>
                  close
                </Link>
              </button>
              <div>I am a modal</div>
              <form>
                <input />
                <button>tab navigation</button>
                <button>stays</button>
                <button>inside</button>
                <button>the modal</button>
              </form>
            </Modal>
          </div>
          <div id="hero" className="Hero" style={{backgroundImage: 'url(https://images.alphacoders.com/633/633643.jpg)'}}>
            <div className="content">
              <img className="logo" src="http://www.returndates.com/backgrounds/narcos.logo.png" alt="narcos background" />
              <h2>Season 2 now available</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque id quam sapiente unde voluptatum alias vero debitis, magnam quis quod.</p>
              <input
                type="text"
                value={this.state.url}
                onChange={evt => {
                  this.setState({
                    url: evt.target.value
                  })
                  }
                }
                onKeyDown={evt => {
                  if (evt.keyCode === 13) {
                    this.myRef.current.reload(evt.target.value)
                    this.setState({
                      url: evt.target.value
                    })
                  }
                  }
                }
                />

            </div>
          </div>
          <Switch>
            <Route exact path="/" render={() => {
              init = true;
              socket.emit('create', defaultRoomID);
              return (
                <div>
                <Redirect to={defaultRoomID} />
                </div>
               );
            }}/>
            <Route path="/:roomID" render={({ match }) => {

              return (
                <div>
                <input
                  type="text"
                  value={this.state.text}
                  onChange={evt => this.setState({
                    text: evt.target.value
                  })}
                  onKeyDown={evt => this._add(evt)}
                  />
                <button onClick={() => {
                  this._addMessage(this.state.text)
                  this.setState({text: ''});
                }}>
                  add chat
                </button>
                <ChatPane>
                  {this.state.chatheads}
                </ChatPane>
                <Player ref={this.myRef} url={this.state.url} portion="1" openModal={this.doNothing.bind(this)} playing={false} room={match.params.roomID} socket={socket} rid={rid} init={init} />
                </div>
              );
            }}/>

          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
