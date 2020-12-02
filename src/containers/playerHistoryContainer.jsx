import React, {Component} from 'react'
import axios from 'axios';
import PropTypes from 'prop-types';
import CanvasJSReact from "../libs/canvasjs/canvasjs.react";
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const API_URL = process.env.REACT_APP_API_URL;

const tierOffsets = {
    'bronze': {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    },
    'silver': {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    },
    'gold': {
        5: 28,
        4: 28,
        3: 28,
        2: 28,
        1: 28
    },
    'platinum': {
        5: 26,
        4: 24,
        3: 21,
        2: 18,
        1: 16
    },
    'diamond': {
        5: 4,
        4: 12,
        3: 10,
        2: 4,
        1: 0
    },
    'master': {
        1: -6
    },
};

class PlayerHistoryContainer extends Component {

    constructor() {
        super();

        this.state = {history: []};
    }

    componentDidMount() {
        this.serviceUrl = `${API_URL}/${this.props.platform}/${this.props.region}`;
        const reqUrl = `${this.serviceUrl}/players/${encodeURIComponent(this.props.username)}/ranked/history`;

        axios.get(reqUrl)
            .then(res => this.initHistory(res.data))
            .catch(error => {console.error(error);});
    }

    render() {
        if (this.state.history.length === 0) return <div></div>;

        let rpDataPoints = [];
        let placeDataPoints = [];
        let kaDataPoints = [];
        let matchDataPoints = [];

        const matchResults = this.state.history.slice(0,10).reverse();
        let previousRank = null;
        matchResults.forEach(rank => {
            if (!previousRank) {
                previousRank = rank;
                return;
            }

            const deltaPoints = rank.currentRankPoint - previousRank.currentRankPoint;
            const deltaRounds = rank.roundsPlayed - previousRank.roundsPlayed;

            if(deltaRounds === 1){
                let currentRankSum = rank.avgRank * rank.roundsPlayed;
                let prevRankSum = previousRank.avgRank * previousRank.roundsPlayed;

                // let currentKda = Math.round(rank.kda * rank.roundsPlayed);
                // let prevKda = Math.round(previousRank.kda * previousRank.roundsPlayed);
                let kaDelta =  (rank.kills - previousRank.kills) + (rank.assists - previousRank.assists);

                let prevMatchRank = Math.round(currentRankSum - prevRankSum);


                let placePoints = 64 - (prevMatchRank * 4);
                let placeRp = placePoints / 2;

                // let kaS = kaDelta;
                let kaRp = Math.min(kaDelta, 10) * 3;

                let prevTier = previousRank.currentTier.toLowerCase();
                let prevSubTier = previousRank.currentSubTier.toLowerCase();

                // 3920 max rp is 18
                // 3895 max rp is 19
                // use tier when the match was started
                let offset = 64 - tierOffsets[prevTier][prevSubTier];
                let offsetRp = offset / 2;

                let matchPoints = placeRp + kaRp - offsetRp
                matchPoints = Math.round(matchPoints);

                rpDataPoints.push({x: rank.roundsPlayed, y: deltaPoints});
                placeDataPoints.push({x: rank.roundsPlayed, y: prevMatchRank});
                kaDataPoints.push({x: rank.roundsPlayed, y: kaDelta});
                matchDataPoints.push({x: rank.roundsPlayed, y: matchPoints});
            } else {
              /**
                for(let i = 0; i < deltaRounds; i++){
                    const roundNumber = rank.roundsPlayed + deltaRounds - i;
                    rpDataPoints.push({x: roundNumber, y: deltaPoints / deltaRounds});
                }
               **/
            }

            previousRank = rank;
        });

        /**
        let dom = this.state.history.map(rank => <div className={`row`}>
            <div className={`col`}>{rank.roundsPlayed}</div>
            <div className={`col`}>{rank.currentRankPoint}</div>
            <div className={`col`}>{rank.wins}</div>
            <div className={`col`}>{rank.kialls}</div>
            <div className={`col`}>{rank.assists}</div>
        </div>);

        const header = <div className={`row font-weight-bold`}>
            <div className={`col`}>games</div>
            <div className={`col`}>rp</div>
            <div className={`col`}>wins</div>
            <div className={`col`}>kills</div>
            <div className={`col`}>assists</div>
        </div>;
        **/

        const rpOptions = {
            theme: "light2",
            animationEnabled: true,
            axisY: {
                title: "rp",
                includeZero: true
            },
            data: [{
                type: "column",
                markerSize: 15,
                dataPoints: rpDataPoints
            }]
        }

        // let avgRankData = this.state.history.map(rank => { return {x: rank.roundsPlayed, y: rank.avgRank}});
        // avgRankData = avgRankData.slice(0, avgRankData.length - 1);

        const placeOptions = {
            theme: "light2",
            animationEnabled: true,
            axisY: {
                title: "place",
                reversed:  true,
                maximum: 15
            },
            data: [{
                type: "scatter",
                markerSize: 15,
                dataPoints: placeDataPoints
            }]
        };

        const kaOptions = {
            theme: "light2",
            animationEnabled: true,
            axisY: {
                title: "kas"
            },
            data: [{
                type: "scatter",
                markerSize: 15,
                dataPoints: kaDataPoints
            }]
        }

        const matchPointOptions = {
            theme: "light2",
            animationEnabled: true,
            axisY: {
                title: "match points",
                includeZero: true
            },
            data: [{
                type: "column",
                markerSize: 15,
                dataPoints: matchDataPoints
            }]
        }

        // dom = [header, dom];

        return <div>
            <div className={`row`}>
                <div className={`col-12`}>
                    <CanvasJSChart options = {rpOptions} /*onRef={ref => this.chart = ref}*//>
                </div>
                <div className={`col-12 d-none`}>
                    <CanvasJSChart options = {matchPointOptions} /*onRef={ref => this.chart = ref}*//>
                </div>
                <div className={`col-12`}>
                    <CanvasJSChart options = {placeOptions} /*onRef={ref => this.chart = ref}*//>
                </div>
                <div className={`col-12`}>
                    <CanvasJSChart options = {kaOptions} /*onRef={ref => this.chart = ref}*//>
                </div>
            </div>

        </div>;
    }

    initHistory(ranks){
        const data = ranks.map(rank => rank.attributes.rankedGameModeStats.squad);
        this.setState({history: data});
    }

}

PlayerHistoryContainer.propTypes = {
    platform: PropTypes.string,
    region: PropTypes.string,
    username: PropTypes.string
}

export default PlayerHistoryContainer;
