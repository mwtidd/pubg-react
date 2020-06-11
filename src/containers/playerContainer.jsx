import React, {Component} from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {mapMap} from "../static/mapMap";
import MatchListComponent from "../components/matchListComponent";
import {getMatch} from "../actions";
import {connect} from "react-redux";
import {weaponNameMap} from "../static/weaponNameMap";
import {weaponTypeMap} from "../static/weaponTypeMap";
import AverageDataRow from "../components/tables/averageDataRow";
import TotalDataRow from "../components/tables/totalDataRow";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";
import PlayerHistoryContainer from "./playerHistoryContainer";


class PlayerContainer extends Component {

    serviceUrl = '';
    state = { player: null, rank: null, loaded: true, offenseScore: 0, matchIds: [], teammates: [], matchCount: 0, timeSurvived: 0,
        topCount: 0, loadedMatchCount:0, loadedAdvancedMatchCount: 0, weapons: [], weaponTypes: [],
        loadedMatches: false, matchList: [], loadedMatchIds: [], showHistoryModal: false};

    // damageCausers = [];
    // damageCauserAmounts = [];
    // damageCauserCounts = [];
    damageCauserTypes = [];
    damageCauserTypeAmounts = [];
    damageCauserTypeCounts = [];

    constructor() {
        super();

        this.tabRef = React.createRef();
        this.tabContentRef = React.createRef();

        this.selectTab = this.selectTab.bind(this)
        this.parseTelemetryData = this.parseTelemetryData.bind(this);

        if(window.localStorage.getItem('storedMatches')){
            // this.state.matches = JSON.parse(window.localStorage.getItem('storedMatches'));
        }
    }

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.matches.length !== prevProps.matches.length){
            this.processMatches();
            let loadedMatchCount = this.getMyMatches().length;
            // console.log(`loaded ${loadedMatchCount} of ${this.state.matchCount} matches`);
            if(loadedMatchCount === this.state.matchCount){
                //alert();

                console.log('update loaded');
                this.setState({loaded: true});
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log('----');
        console.log('update component');
        console.log('props');
        console.log(nextProps);
        console.log('states');
        console.log(nextState);
        return true;
    }

    getData() {
        if(!this.props.username) return;

        this.serviceUrl = 'http://localhost:3000/' + this.props.platform + '/' + this.props.region;
        const reqUrl = this.serviceUrl + '/players/' + encodeURIComponent(this.props.username) + '/ranked';
        console.log(`get player ${reqUrl}`);

        axios.get(reqUrl)
            .then(res => this.initPlayer(res.data))
            .catch(error => {console.error(error);});
    }

    initPlayer(data){
        if(data){
            console.log('loaded player');
            console.log(data);
            let player = data.relationships.player;
            let rankedSeason = data.attributes.rankedGameModeStats.squad;
            let matches = [];//player.relationships.matches;

            // alert(`${this.props.username} ${rankedSeason.currentTier} ${rankedSeason.currentSubTier}`);

            console.log('update player | rank | matchCount | matchIds');

            this.setState({player: player, rank: rankedSeason}); //, matchCount: matches.length, matchIds: matches.map(match => match.id)});

            // console.log(`match count is ${matches.length}`);
            if(matches) matches.forEach(match => {
                // this.props.fetchMatch(match.id);
            });
        } else {
            console.error('the player was not found');
        }
    }

    render() {

        // console.log('render');

        let progressDom =  <div className={``}>
            <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: ''+Math.floor((100*(this.state.loadedAdvancedMatchCount / this.state.matchCount))) + '%'}}></div>
            </div>
            <div>
                loaded data for {this.state.loadedAdvancedMatchCount} of {this.state.matchCount} matches
            </div>
        </div>;


        let showTotals = this.getRequestParam('totals') === '1';
        let statDom = <div className={`stats`}>
            {(!showTotals) && <AverageDataRow username={this.props.username} rank={this.state.rank} state={this.state} onToggleHistoryModal={() => this.setState({showHistoryModal: !this.state.showHistoryModal})}/>}
            {(showTotals) && <TotalDataRow username={this.props.username} rank={this.state.rank} state={this.state}/>}
        </div>;


        let matchDom = <div className={`matches mb-4`}>
            <MatchListComponent matches={this.state.matchList}/>
        </div>;

        let showMatches = this.getRequestParam('matches') === '1';
        if(!showMatches){
            matchDom = <div></div>;
        }

        let dom = <div></div>; // progressDom;


        let showCharts= this.getRequestParam('charts') === '1';
        dom = <div>
            {statDom}
            <Modal show={this.state.showHistoryModal} onHide={() => this.setState({showHistoryModal: false})} dialogClassName="modal-90w">
                <Modal.Header closeButton>Ranked History</Modal.Header>
                <Modal.Body>
                    <PlayerHistoryContainer platform={this.props.platform} region={this.props.region} username={this.props.username}/>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        </div>
        return <div>{dom}</div>
    }


    selectTab(event){
        event.preventDefault();

        let selectedIndex = Array.prototype.slice.call(event.target.parentElement.parentElement.children).indexOf(event.target.parentElement);

        // console.log(this.tabRef.current);

        Array.prototype.slice.call(this.tabRef.current.children).forEach(element => {
            element.children.item(0).classList.remove("active");
        });
        Array.prototype.slice.call(this.tabContentRef.current.children).forEach(element => {
            element.classList.remove("active");
        });

        this.tabRef.current.children.item(selectedIndex).children.item(0).classList.add("active");
        this.tabContentRef.current.children.item(selectedIndex).classList.add("active");
        return false;
    }


    getRequestParam(name){
        if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(window.location.search))
            return decodeURIComponent(name[1]);
    }


    matchesDateFilter(date){
        let days = this.getRequestParam('days');
        if (days) {
          days =  Number.parseInt(days) - 1;
        } else {
            days = 0;
        }

        let today = new Date();
        if (today.getHours() < 6) {
            days++;
        }

        // filter anything within the week
        let pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);
        pastDate.setHours(6);
        pastDate.setMinutes(0);

        return date > pastDate;
    }

    matchesTypeFilter(type){
        if (type === 'tdm') return false;

        return true; // true; //type === 'squad';
    }

    matchesMapFilter(map){
        return map !== 'Range_Main';
    }

    processMatches() {

        // console.log('process matches');

        let matchArray = this.state.matchList;

        const reviveArray = [];
        const damageArray = [];
        const assistArray = [];
        const killArray = [];
        const timeSurvivedArray = [];

        const add = (a, b) =>
            a + b;

        const myMatches = this.getMyMatches();

        myMatches.forEach(match => {

            // console.log(this.state.matchList);

            if(this.state.loadedMatchIds.indexOf(match.id) > -1){
                return;
            }

            const telemetryData = this.getMyTelemetryData(match);

            // const advancedMetrics = this.getAdvancedMetrics(telemetryData);

            const participants = this.getParticipants(match);

            participants.forEach(item =>
                {
                    if (item.attributes.stats.playerId === this.state.player.id) {

                        const stats = item.attributes.stats;

                        match.winPlace = stats.winPlace;
                        timeSurvivedArray.push(stats.timeSurvived);
                        reviveArray.push(stats.revives);
                        damageArray.push(stats.damageDealt);
                        assistArray.push(stats.assists);
                        killArray.push(stats.kills);

                        // todo: reconsider this (for now summary data includes bots)
                        /**
                        // console.log(item.attributes.stats);
                        match.kills = stats.kills;

                        match.damageDealt = stats.damageDealt;
                        match.dbnos = stats.DBNOs;
                        match.revives = stats.revives;
                        match.timeSurvived = stats.timeSurvived;

                        // console.log(`win place: ${match.winPlace}`);
                        // console.log(`kills: ${match.kills}`);
                        // console.log(`damage dealt: ${match.damageDealt}`);

                        // killArray.push(stats.kills);
                        killArray.push(telemetryData.humanKillEvents.length);
                        damageArray.push(stats.damageDealt);
                         **/
                    }
                }
            );

            matchArray.push( {'overallPoints': match.overallPoints, mapName: mapMap[match.mapName],
                'gameMode': match.gameMode, 'damageDealt': match.damageDealt,
                'humanKills': telemetryData.humanKillEvents.length, 'botKills': telemetryData.botKillEvents.length,
                'humanKnocks': telemetryData.humanKnockEvents.length, 'botKnocks': telemetryData.botKnockEvents.length,
                'winPlace': match.winPlace, 'killPoints': match.killPoints, 'winPoints': match.winPoints,
                'timeSurvived': match.timeSurvived, // 'advancedMetrics': advancedMetrics,
                'date': new Date(match.createdAt), 'revives': match.revives, 'id': match.id} );
        });

        if(matchArray.length > 1){
            matchArray = matchArray.sort( (a,b) => b.date - a.date)
        }

        // todo: aggregate advanced metrics from matchArray
        // const weaponsAndTypes = this.getWeaponsAndWeaponTypes(tAM);

        const winCount = matchArray.filter(match => match.winPlace === 1).length;

        // console.log('wins: ');
        // console.log(matchArray.filter(match => match.winPlace === 1));

        const topCount = matchArray.filter(match => match.winPlace <= 5).length;
        const totalRevives = reviveArray.reduce(add,0);
        const totalTimeSurvived = timeSurvivedArray.reduce(add,0);

        // const deathCount = matchArray.filter(match => match.winPlace > 1).length;

        const totalKills = killArray.reduce(add,0);
        // const totalKos = 0; // tAM.damageCauserCounts.reduce(add,0);
        const totalAssists = assistArray.reduce(add,0);
        const totalDamage = damageArray.reduce(add,0); // tAM.damageCauserAmounts.reduce(add,0);
        // const offenseScore = ((totalKos * 100) + totalDamage)/2;

        const loadedMatchIds = matchArray.map(match => match.id);

        console.log('update matchList | stats | loadedState');

        this.setState({ // weapons: weaponsAndTypes.weapons, weaponTypes: weaponsAndTypes.weaponTypes,
            matchList: matchArray, matchCount: matchArray.length,
            reviveCount: totalRevives, totalKills: totalKills, totalAssists: totalAssists, totalDamage: totalDamage,
            winCount: winCount,  topCount: topCount,
            timeSurvived: totalTimeSurvived, loadedMatches: true, loadedMatchIds: loadedMatchIds});
    }

    getParticipants(match){
        let participants = [];
        match.relationships.rosters.forEach(roster => {
            participants = participants.concat(roster.relationships.participants);
        });
        return participants;
    }

    getMyMatches(){
        let myMatches = this.props.matches;
        // console.log(`total match count is ${myMatches.length}`);
        // console.log(this.props.matches);
        myMatches = myMatches.filter(match => this.state.matchIds.indexOf(match.id) > -1);
        // console.log(`my match count is ${myMatches.length}`);
        // console.log(this.state.matchIds);
        return myMatches;
    }

    getMyTelemetryData(match){
        const accountId = this.state.player.id;

        let knockEvents = match.telemetryData.knockEvents;
        knockEvents = knockEvents.filter(event => event.attacker && event.attacker.accountId === accountId);
        knockEvents = knockEvents.filter(event => event.attacker && event.victim && event.attacker.teamId !== event.victim.teamId);
        let humanKnockEvents = knockEvents.filter(event => event.victim.accountId.indexOf('ai.') === -1);
        let botKnockEvents = knockEvents.filter(event => event.victim.accountId.indexOf('ai.') === 0);

        let killEvents = match.telemetryData.killEvents;
        killEvents = killEvents.filter(event => event.killer && event.killer.accountId === accountId);
        killEvents = killEvents.filter(event => event.killer && event.victim && event.killer.teamId !== event.victim.teamId);
        let humanKillEvents = killEvents.filter(event => event.victim.accountId.indexOf('ai.') === -1);
        let botKillEvents = killEvents.filter(event => event.victim.accountId.indexOf('ai.') === 0);

        let instaKills = killEvents.filter(event => event.dBNOId === -1);
        let humanInstaKills = instaKills.filter(event => event.victim.accountId.indexOf('ai.') === -1);
        let botInstaKills = instaKills.filter(event => event.victim.accountId.indexOf('ai.') === 0);
        let killedHumanVictims = [];
        let killedBotVictims = [];
        instaKills.forEach(event => {
            // console.log(event.victim.accountId);
            const victimId = event.victim.accountId;
            if(victimId.indexOf('ai.') === 0) {
                // is bot
                if(killedBotVictims.indexOf(victimId) === -1) {
                    killedBotVictims.push(victimId);
                }
            } else {
                // is human
                if(killedHumanVictims.indexOf(victimId) === -1) {
                    killedHumanVictims.push(victimId);
                }
            }

        });

        /**
        let attackEvents = match.telemetryData.attackEvents;
        // remove team kills
        attackEvents = attackEvents.filter(event => event.attacker && event.victim && event.attacker.teamId != event.victim.teamId);
        let attackedEvents = attackEvents.filter(event => event.victim && event.victim.accountId === accountId);
        attackEvents = attackEvents.filter(event => event.attacker && event.attacker.accountId === accountId);
        // attackEvents = attackEvents.filter(event => event.damage > 0);

        let humanAttackEvents = attackEvents.filter(event => !this.isBot(event.victim.accountId));
        let botAttackEvents = attackEvents.filter(event => this.isBot(event.victim.accountId));
        **/

        let uniqueHumanKnocks = [];
        let uniqueBotKnocks = [];
        let knockedVictims = knockEvents.map(event => event.victim.accountId);
        const knockedBots = []; //knockedVictims.filter(id => id.indexOf('ai.') === 0);
        const knockedHumans = []; //knockedVictims.filter(id => id.indexOf('ai.') === -1);
        const botKnocks = knockEvents.filter(event => this.isBot(event.victim.accountId));
        const humanKnocks = knockEvents.filter(event => !this.isBot(event.victim.accountId));
        knockEvents.forEach(event => {
            const victimId = event.victim.accountId;
            if(victimId.indexOf('ai.') === 0){
                // is bot
                if(knockedBots.indexOf(victimId) === -1){
                    knockedBots.push(victimId)
                    uniqueBotKnocks.push(event);
                }
            } else {
                // is human
                if(knockedHumans.indexOf(victimId) === -1){
                    knockedHumans.push(victimId)
                    uniqueHumanKnocks.push(event);
                }
            }


        });
        knockEvents = uniqueHumanKnocks;


        let uniqueHumanVictims = knockedHumans;
        let uniqueBotVictims = knockedBots;
        killedHumanVictims.forEach(victimId => {
            if(victimId.indexOf('ai.') === 0){
                // is bot
                if(uniqueBotVictims.indexOf(victimId) === -1){
                    uniqueBotVictims.push(victimId)
                }
            } else {
                // is human
                if(uniqueHumanVictims.indexOf(victimId) === -1){
                    uniqueHumanVictims.push(victimId)
                }
            }
        });

        let bots = uniqueBotVictims; //uniqueHumanVictims.filter(victimId => victimId.indexOf('ai.') === 0);
        let humans = uniqueHumanVictims; //uniqueHumanVictims.filter(victimId => victimId.indexOf('ai.') === -1);

        // console.log(`bots: ${bots.length} humans: ${humans.length}`);


        let assistEvents = match.telemetryData.killEvents;
        assistEvents = assistEvents.filter(event => event.assistant && event.killer && event.assistant.accountId !== event.killer.accountId && event.assistant.accountId === accountId);

        let deathEvents = match.telemetryData.killEvents;
        deathEvents = deathEvents.filter(event => event.victim && event.victim.accountId === accountId);

        return {
            // humanAttackEvents: humanAttackEvents,
            // botAttackEvents: botAttackEvents,
            humanKnockEvents: humanKnockEvents,
            botKnockEvents: botKnockEvents,
            humanKillEvents: humanKillEvents,
            botKillEvents: botKillEvents,
            deathEvents: deathEvents,
            assistEvents: assistEvents,
            botInstaKills: botInstaKills,
            humanInstaKills: humanInstaKills
        };
    }

    isBot(accountId){
        return accountId.indexOf('ai.') === 0;
    }

    parseTelemetryData(r) {
        const playerEvents = [];
        const stateEvents = [];
        const positionEvents = [];
        const killEvents = [];
        const knockEvents = [];
        const deathEvents = [];
        const attackEvents = [];

        const accountId = this.state.player.id;

        let dropTime = null;

        const playerTeamId = r.data.filter(event => {
            if (event['character'] && event['character']['accountId'] === accountId && event['_T'] === 'LogPlayerCreate') {
                return true;
            }
            return false;
        })[0]['character']['teamId'];

        const teammateCreateEvents = r.data.filter(event => {
            if (event['character'] && event['character']['accountId'] !== accountId && event['character']['teamId'] === playerTeamId && event['_T'] === 'LogPlayerCreate') {
                return true;
            }
            return false;
        });

        const teammates = teammateCreateEvents.map(event => {return {name: event['character']['name'], accountId: event['character']['accountId'] }});

        console.log('update teammates');

        this.setState({teammates: this.state.teammates.concat(teammates)});

        r.data.forEach(telemetryEvent => {

            if (!telemetryEvent) {
                // this should never happen
                return;
            }

            // parse kill and death event
            if (telemetryEvent['_T'] === 'LogPlayerKill') {
                if (telemetryEvent['killer'] && telemetryEvent['killer']['accountId'] === accountId) {
                    killEvents.push(telemetryEvent);
                } else if (telemetryEvent['victim']['accountId'] === accountId) {
                    deathEvents.push(telemetryEvent);
                }
            }

            // parse knock event
            if (telemetryEvent['_T'] === 'LogPlayerMakeGroggy'){
                if (telemetryEvent['attacker'] && telemetryEvent['attacker']['accountId'] === accountId) {
                    knockEvents.push(telemetryEvent);
                } else if (telemetryEvent['victim']['accountId'] === accountId) {
                    // deathEvents.push(telemetryEvent);
                }
            }

            // parse attack and attached events
            if (telemetryEvent['_T'] === 'LogPlayerTakeDamage') {
                if (telemetryEvent['attacker'] && telemetryEvent['attacker']['accountId'] === accountId) {
                    attackEvents.push(telemetryEvent);
                } else if (telemetryEvent['victim']['accountId'] === accountId) {
                    playerEvents.push(telemetryEvent);
                }
            }

            if (telemetryEvent['_T'] === 'LogPlayerAttack') {
                if (telemetryEvent['attacker']['accountId'] === accountId) {
                    // attackEvents.push(telemetryEvent);
                }
            }

            // log circle event
            if (telemetryEvent['_T'] === 'LogGameStatePeriodic') {
                const safeZone = {'safeZone':
                        {'position': telemetryEvent['gameState']['safetyZonePosition'],
                            'radius':  telemetryEvent['gameState']['safetyZoneRadius']}};
                stateEvents.push(safeZone);
            }

        });

        return {/*'stateEvents': filteredStateEvents, 'positionEvents': filteredPostionEvents,*/ 'playerEvents': playerEvents,
            'killEvents': killEvents, 'knockEvents': knockEvents, 'deathEvents': deathEvents, 'attackEvents': attackEvents};
    }

    getAdvancedMetrics(telemetryData) {
        const victims = [];
        // const downed = [];

        const damageCausers = [];
        const damageCauserAmounts = [];
        const damageCauserCounts = [];
        const damageCauserTypes = [];
        const damageCauserTypeAmounts = [];
        const damageCauserTypeCounts = [];

        // todo: maybe support bot events
        telemetryData.humanAttackEvents.forEach(attackEvent => {
            if ( victims.indexOf(attackEvent.victim.name) === -1 ) {
                victims.push(attackEvent.victim.name);
            }

            // update weapons
            const damageCauser = weaponNameMap[attackEvent.damageCauserName];

            if(damageCauser === undefined){
                alert(attackEvent.damageCauserName);
            }

            // only include damaging attack events
            if(attackEvent.damage > 0) {
                if (damageCausers.indexOf(damageCauser) === -1) {
                    damageCausers.push(damageCauser);

                    damageCauserAmounts[damageCausers.indexOf(damageCauser)] = 0;
                    damageCauserCounts[damageCausers.indexOf(damageCauser)] = 0;
                }

                damageCauserAmounts[damageCausers.indexOf(damageCauser)] += attackEvent.damage;

                // update weapon types
                const damageCauserType = weaponTypeMap[attackEvent.damageCauserName];

                if (damageCauserTypes.indexOf(damageCauserType) === -1) {
                    damageCauserTypes.push(damageCauserType);

                    damageCauserTypeAmounts[damageCauserTypes.indexOf(damageCauserType)] = 0;
                    damageCauserTypeCounts[damageCauserTypes.indexOf(damageCauserType)] = 0;
                }

                damageCauserTypeAmounts[damageCauserTypes.indexOf(damageCauserType)] += attackEvent.damage;
            }
        });

        // todo: maybe support bot events
        telemetryData.humanKnockEvents.forEach(event => {

            const damageCauser = weaponNameMap[event.damageCauserName];
            const damageCauserType = weaponTypeMap[event.damageCauserName];

            if(damageCauser === undefined){
                alert(event.damageCauserName);
                return;
            }

            if (damageCausers.indexOf(damageCauser) === -1 || damageCauserTypes.indexOf(damageCauserType) === -1) {
                // weapon does not match an attacking weapon
                alert('non attacking weapon');
                return;
            }

            damageCauserCounts[damageCausers.indexOf(damageCauser)]++;
            damageCauserTypeCounts[damageCauserTypes.indexOf(damageCauserType)]++;
        });

        telemetryData.humanInstaKills.forEach(event => {

            // update weapons
            const damageCauser = weaponNameMap[event.damageCauserName];
            const damageCauserType = weaponTypeMap[event.damageCauserName];

            if(damageCauser === undefined){
                alert(event.damageCauserName);
            }

            if (damageCausers.indexOf(damageCauser) === -1 || damageCauserTypes.indexOf(damageCauserType) === -1) {
                // weapon does not match an attacking weapon
                alert('non attacking weapon');
                return;
            }

            damageCauserCounts[damageCausers.indexOf(damageCauser)]++;
            damageCauserTypeCounts[damageCauserTypes.indexOf(damageCauserType)]++;
        });

        return {
            damageCausers: damageCausers,
            damageCauserAmounts: damageCauserAmounts,
            damageCauserCounts: damageCauserCounts,
            damageCauserTypes: damageCauserTypes,
            damageCauserTypeAmounts: damageCauserTypeAmounts,
            damageCauserTypeCounts: damageCauserTypeCounts
        };

    }

    getWeaponsAndWeaponTypes(advancedMetrics){
        const weapons = [];

        for (let i = 0; i < advancedMetrics.damageCausers.length; i++) {
            const weapon = {
                'name': advancedMetrics.damageCausers[i],
                'kos': advancedMetrics.damageCauserCounts[i],
                'damage': advancedMetrics.damageCauserAmounts[i]
            };

            weapons.push(weapon);
        }

        weapons.sort(function(a, b) {
            if (a.kills === b.kills) {
                return b.damage - a.damage;
            }
            return b.kills - a.kills;
        });

        const weaponTypes = [];

        for (let i = 0; i < advancedMetrics.damageCauserTypes.length; i++) {
            const weaponType = {
                'name': advancedMetrics.damageCauserTypes[i],
                'kos': advancedMetrics.damageCauserTypeCounts[i],
                'damage': advancedMetrics.damageCauserTypeAmounts[i]
            };

            weaponTypes.push(weaponType);
        }

        weaponTypes.sort(function(a, b) {
            if (a.kills === b.kills) {
                return b.damage - a.damage;
            }
            return b.kills - a.kills;
        });

        console.log('update weapons');

        return {
            weapons: weapons,
            weaponTypes: weaponTypes
        };
    }

}

PlayerContainer.propTypes = {
    platform: PropTypes.string,
    region: PropTypes.string,
    username: PropTypes.string
}

const mapStateToProps = state => {
    return {
        matches: state.matchReducer.matchData.matches
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchMatch: (matchId) => dispatch(getMatch(matchId))
    }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerContainer)
