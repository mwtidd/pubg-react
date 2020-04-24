import React, {Component} from 'react';
import './App.css';
import PlayerContainerComponent from "./containers/playerContainer";

export default class App extends Component {

  queuedGamertag = null;

  constructor() {
    super();
    this.state = {gamertag: null};
    this.gamertagInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.getRequestParam('update')) {
      setInterval(()=> {
        console.log('update');
        this.forceUpdate();
      }, Number.parseInt(this.getRequestParam('update')) * 60 * 1000)
    }
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

  getUI(){
    let showAverages = this.getRequestParam('averages') === '1';
    let streamView = this.getRequestParam('stream') === '1';
    let form = this.getForm();

    return <div>
      <div className={`container`}>
        {form}
      </div>
      <div className={`p-relative`}>
        {(this.state.gamertag) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={this.state.gamertag}/>}
        {
         <div className={`table-header`}>
           <div className={`container-xl stats`}>
             <div className={`background`}></div>
             <div className={`row`}>
               <div className={`col-4 text-left`}>
                today's stats
               </div>
               <div className={`col-1`}>
                 <span>kills </span>
               </div>
               <div className={`col-1`}>
                 <span>damage </span>
               </div>
               <div className={`col-1`}>
                 {(showAverages) && <span>top 5 % </span>}
                 {(!showAverages) && <span>top 5 </span>}
               </div>
               <div className={`col-1`}>
                 {(showAverages) && <span>win % </span>}
                 {(!showAverages) && <span>wins </span>}
               </div>
             </div>
           </div>
         </div>
        }
        <div className={`table-rows`}>
          {(!streamView) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'GeneraIButters'}/>}
          {(!streamView) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'I0I Stryker I0I'}/>}
          {(!streamView) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'GriftBot'}/>}
          {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'BLiTz5'}/>}
          {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'n0FNGclue'}/>}
          {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'LSG Vicious'}/>}

          {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'krayzie0369'}/>}
          {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'xMachiavellii'}/>}
          {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'I KRAZl I'}/>}
          {(true) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={'dr john ryan'}/>}
        </div>
      </div>
      {(streamView) && <div className={`p-relative`}>
        <div className={`webcam-overlay`} >
        </div>
      </div>}

    </div>
  }

  getRequestParam(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(window.location.search))
      return decodeURIComponent(name[1]);
  }

  render(){
    if(this.queuedGamertag){
      this.setState({gamertag: this.queuedGamertag });
      this.queuedGamertag = null;
    }
    /**
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`I KRAZl I`}/>}
     {(true) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`GeneraIButters`}/>}
     {(true) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`The real CHICO`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`krayzie0369`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`reecespuffs244`}/>}
     {(true) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`dr john ryan`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`BornCountry8`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`Viciouscc69`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`snikerdoodlez10`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`C0bra bubblez96`}/>}
     {(false) && <PlayerContainerComponent platform={`xbox`} region={`na`} username={`Project Alice`}/>}
     **/
    return this.getUI();
  }
}
