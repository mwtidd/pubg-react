import React, {Component} from 'react';
// import './App.css';
import PlayerContainer from "./containers/playerContainer";
import PlayerListContainer from "./containers/playerListContainer";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Swipeout from "rc-swipeout";
import 'rc-swipeout/assets/index.css';

export default class App extends Component {

  queuedGamertag = null;

  constructor() {
    super();
    this.state = {gamertag: null};
    this.gamertagInputRef = React.createRef();
    this.clearPlayers = this.clearPlayers.bind(this);
    this.deletePlayer = this.deletePlayer.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.gamertag === nextState.gamertag;
  }

  componentDidMount() {
    if (this.getRequestParam('update')) {
      setInterval(()=> {
        console.log('update');
        this.forceUpdate();
      }, Number.parseInt(this.getRequestParam('update')) * 60 * 1000)
    }
  }

  clearPlayers(){
    window.localStorage.setItem('players', []);
    this.setState({});
  }

  addPlayer(player){
      let players = this.getPlayers();
      let playerStrings = players.map(_player => JSON.stringify(_player));
      if (playerStrings.indexOf(JSON.stringify(player)) === -1) {
        players.push(player);
        window.localStorage.setItem('players', JSON.stringify(players));
      }
  }

  getPlayers(){
    if(window.localStorage.getItem('players')){
      return JSON.parse(window.localStorage.getItem('players'));
      // this.state.matches = JSON.parse(window.localStorage.getItem('storedMatches'));
    }
    return [];
  }

  getForm(){
    return <form className={`col-md-6 col-lg-3 d-none`} onSubmit={(event) => {
      event.preventDefault();
      event.stopPropagation();
      this.queuedGamertag = this.gamertagInputRef.current.value
      this.setState({gamertag: null});
      return false;
    }}>
      <div className={`form-group`}>
        <label>
          Gamertag
          <input id={`gamertagInput`} type={`text`} ref={this.gamertagInputRef} className={`form-control`} />
        </label>
      </div>
      <button type={`submit`} className={`btn btn-primary`}>SUBMIT</button>
    </form>
  }

  addPlayerSubmit(form) {
    let player = {
      gt: form.gamertag.value,
      pf: form.platform.value
    };

    this.addPlayer(player);

  }

  getUI(){
    let showTotals = this.getRequestParam('totals') === '1';
    let streamView = this.getRequestParam('stream') === '1';
    let matchView = this.getRequestParam('matchView') === '1';
    let form = this.getForm();

    let dom = <div></div>;

    if(matchView){
      dom = <div className={`p-relative`}>
        <div className={`container`}>
          {/*
            <MatchContainer matchId={`12132c70-4c93-499d-8d4c-2f965cc1382e`} />
          <MatchContainer matchId={`5b3a6bed-7f6b-48fb-aa31-bc3be5f024be`} />
          <MatchContainer matchId={`dc8b5982-4233-45b1-81c3-6707c40a4760`}/>
          <TourneyContainer />

          */}
        </div>
      </div>;
    } else {
      if(this.state.gamertag) alert(this.state.gamertag);
      dom = <div className={`p-relative h-100`}>
        <div className={`container d-none`}>
          {form}
        </div>

        <Modal show={this.state.showModal} onHide={()=>{this.setState({showModal: false})}}>
          <Modal.Header closeButton>
            <Modal.Title>Add a Player</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={(e)=>{e.preventDefault(); this.addPlayerSubmit(e.currentTarget); this.setState({showModal: false})}}>
              <Form.Group controlId="gamertag">
                <Form.Label>Gamertag</Form.Label>
                <Form.Control type="text" placeholder="Enter gamertag" />
                <Form.Text className="text-muted d-none">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group controlId="platform">
                <Form.Label>Platform</Form.Label>
                <Form.Control type="text" placeholder="Enter Platform" defaultValue="xbox" />
              </Form.Group>

              <Button variant="primary" type="submit" >
                Submit
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
        <div className={`container-xl p-0`}>
          <div className={`p-relative p-1 table table-dark`}>
            {
              <div className={`table-header`}>
                <div className={`stats`}>
                  <div className={`background stats-bar`}></div>
                  <div className={`table-row row align-items-center`}>
                    <div className={`col-6 col-md-3 text-left`}>
                      ranked avg stats
                    </div>
                    <div className={`col-2 col-md-1`}>
                      <span>kda </span>
                    </div>
                    <div className={`col-1 d-none d-md-block`}>
                      <span>kills </span>
                    </div>
                    <div className={`col-1 d-none d-md-block`}>
                      <span>assists </span>
                    </div>
                    <div className={`col-2 col-md-1`}>
                      <span>dmg </span>
                    </div>
                    <div className={`col-1 d-none d-md-block`}>
                      {(!showTotals) && <span>win % </span>}
                      {(showTotals) && <span>wins </span>}
                    </div>
                    <div className={`col-1`}>
                      <span>rank </span>
                    </div>
                    <div className={`col-1 d-none d-md-block`}>
                      <span>adj rank </span>
                    </div>
                  </div>
                </div>
              </div>
            }
            <div className={`table-rows`}>
              {
                (streamView) && <PlayerContainer platform={`xbox`} region={`na`} username={'dr john ryan'}/>
              }
              {(!streamView) && this.getPlayers().map((player, index) =>
                  <Swipeout key={`player-${player.gt.replace(' ', '-')}-${player.pf}`} autoClose={true} right={[{
                    text: 'delete',
                    onPress:() => this.deletePlayer(player),
                    style: { backgroundColor: '#ce0808', color: 'white' },
                    className: 'fa fa-trash'
                  }]}>
                    <PlayerContainer platform={player.pf} region={`na`} username={player.gt} onDelete={()=>{this.deletePlayer(player)}}/>
                  </Swipeout>
              )}

            </div>
          </div>
        </div>
        {(!streamView) &&  <div className={`container-xl mt-2`}>
          <div className={`row justify-content-between`}>
            <div className={`d-flex`}>
              <Button variant="primary" onClick={()=>{this.setState({showModal: true})}}>
                Add Player
              </Button>
            </div>
          </div>

        </div>}
        <div className={`d-none`}>
          {(this.state.gamertag) && <PlayerContainer platform={`xbox`} region={`na`} username={this.state.gamertag}/>}
        </div>
        {(streamView) && <>
          <div className={`webcam-overlay`} >
            <div className={`webcam-container `}></div>
          </div>
          <div className={`gamertag-overlay`} >
            <div className={`p-relative`}>
              <div className={`container row justify-content-center m-auto`}>
                <div className={`container gamertag-container text-white text-center`}>
                  dr john ryan
                </div>
              </div>
            </div>
          </div>
        </>}
        {(false) && <div className={`d-none`}>
          <PlayerListContainer ></PlayerListContainer>
        </div>}
      </div>;
    }

    return dom;
  }

  deletePlayer(player) {
    let players = this.getPlayers();
    let playerStrings = players.map(_player => JSON.stringify(_player));
    let playerIndex = playerStrings.indexOf(JSON.stringify(player));
    players.splice(playerIndex, 1);
    window.localStorage.setItem('players', JSON.stringify(players));
    this.setState({});
  }

  getRequestParam(name){
    if(name = (new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(window.location.search))
      return decodeURIComponent(name[1]);
  }

  render(){
    if(this.queuedGamertag){
      this.setState({gamertag: this.queuedGamertag });
      this.queuedGamertag = null;
    }
    return this.getUI();
  }
}
