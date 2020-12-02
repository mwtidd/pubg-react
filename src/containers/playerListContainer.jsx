import React, {Component} from 'react'
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class PlayerListContainer extends Component {

    componentDidMount() {
        this.serviceUrl = `${API_URL}/${this.props.platform}/${this.props.region}`;
        const reqUrl = `${this.serviceUrl}/players`;

        axios.get(reqUrl)
            .then(res => this.initPlayers(res.data))
            .catch(error => {console.error(error);});
    }

    render(){
        if(!this.state) return <div></div>;
        return <table className={`table table-dark`}>
            <tbody>
                {this.state.players.map(player =>
                <tr key={player.id}>
                    <td>
                        {player.attributes.name}
                    </td>
                </tr>)}
            </tbody>

        </table>
    }

    initPlayers(players){
        this.setState({players: players});
    }
}

export default PlayerListContainer;
