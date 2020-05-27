import React, {Component} from 'react'
import axios from 'axios';
import PropTypes from 'prop-types';
import {mapMap} from "../static/mapMap";
import WeaponChartComponent from "../components/weaponKillChartComponent";
import MatchListComponent from "../components/matchListComponent";
import {getMatch} from "../actions";
import {connect} from "react-redux";
import {weaponNameMap} from "../static/weaponNameMap";
import {weaponTypeMap} from "../static/weaponTypeMap";


class PlayerContainer extends Component {

    serviceUrl = '';
    state = { player: null, loaded: true, offenseScore: 0, matchIds: [], teammates: [], matchCount: 0, timeSurvived: 0,
        topCount: 0, loadedMatchCount:0, loadedAdvancedMatchCount: 0, matches: [], weapons: [], weaponTypes: [],
        loadedMatches: false, matchList: [], loadedMatchIds: []};

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
        if(JSON.stringify(prevProps) !== JSON.stringify(this.props)){
            this.processMatches();
            let loadedMatchCount = this.getMyMatches().length;
            // console.log(`loaded ${loadedMatchCount} of ${this.state.matchCount} matches`);
            if(loadedMatchCount === this.state.matchCount){
                //alert();
                this.setState({loaded: true});
            }
        }
    }

    getData() {
        this.serviceUrl = 'http://localhost:3000/' + this.props.platform + '/' + this.props.region;
        axios.get(this.serviceUrl + '/players/' + encodeURIComponent(this.props.username))
            .then(res => this.initPlayer(res.data))
            .catch(error => {console.error(error);});
    }

    initPlayer(players){
        if(players && players.length > 0){
            let player = players[0];
            let matches = player.relationships.matches;

            this.setState({player: player, matchCount: matches.length, matchIds: matches.map(match => match.id)});

            console.log(`match count is ${matches.length}`);

            matches.forEach(match => {
                this.props.fetchMatch(match.id);
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
                     aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: ''+Math.floor((100*(this.state.loadedAdvancedMatchCount / this.state.matches.length))) + '%'}}></div>
            </div>
            <div>
                loaded data for {this.state.loadedAdvancedMatchCount} of {this.state.matches.length} matches
            </div>
        </div>;


        let showAverages = this.getRequestParam('averages') === '1';
        let statDom = <div></div>;


        if (this.state.loaded) {
            statDom = <div className={`stats`}>
                <div></div>
                {(showAverages) && <averageData state={this.state}/>}
                {(!showAverages) && <totalData state={this.state}/>}
            </div>;
        }


        let matchDom = <div className={`matches mb-4`}>
            <MatchListComponent matches={this.state.matchList}/>
        </div>;

        let showMatches = this.getRequestParam('matches') === '1';
        if(!showMatches){
            matchDom = <div></div>;
        }

        let dom = <div></div>; // progressDom;


        let showCharts= this.getRequestParam('charts') === '1';
        if(this.state.weaponTypes.length > 0 && showCharts){
            dom = <div>
                {statDom}
                <div className={`container`}>
                    <div className={`col-12`}>
                        <div className={`font-weight-bold text-uppercase mb-2`}>Stats by:</div>
                        <ul ref={this.tabRef} className="nav nav-tabs mb-4">
                            <li className="nav-item"><a className={`nav-link active`} href="#home" onClick={this.selectTab}>Weapon Type</a></li>
                            <li className={`nav-item`}><a href="#menu1" className={`nav-link`}  onClick={this.selectTab}>Specific Weapon</a></li>
                        </ul>
                        <div ref={this.tabContentRef} className="tab-content">
                            <div id="home" className="tab-pane active">
                                <h3 className={`text-center text-uppercase`}>Stats by weapon type</h3>
                                <div className={`row mb-4`}>
                                    <div className={`col-12 col-md-6`}>
                                        {<WeaponChartComponent weapons={this.state.weaponTypes} property={'kos'}/>}

                                    </div>
                                    <div className={`col-12 col-md-6`}>
                                        {<WeaponChartComponent weapons={this.state.weaponTypes} property={'damage'}/>}
                                    </div>
                                </div>
                            </div>
                            <div id="menu1" className="tab-pane">
                                <h3 className={`text-center text-uppercase`}>Stats by weapon</h3>
                                <div className={`row mb-4`}>
                                    <div className={`col-12 col-md-6`}>
                                        {<WeaponChartComponent weapons={this.state.weapons} property={'kos'}/>}

                                    </div>
                                    <div className={`col-12 col-md-6`}>
                                        {<WeaponChartComponent weapons={this.state.weapons} property={'damage'}/>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {matchDom}
            </div>;
        } else if(this.state.loadedMatches){
            dom = <div>
                {statDom}
                {progressDom}
                {matchDom}
            </div>
        }

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

        console.log('process matches');

        let matchArray = this.state.matchList;

        const reviveArray = [];
        const timeSurvivedArray = [];

        const add = (a, b) =>
            a + b;

        const myMatches = this.getMyMatches();

        myMatches.forEach(match => {

            console.log(this.state.matchList);

            if(this.state.loadedMatchIds.indexOf(match.data.id) > -1){
                return;
            }

            const telemetryData = this.getMyTelemetryData(match);

            const advancedMetrics = this.getAdvancedMetrics(telemetryData);

            match.included.forEach(item =>
                {
                    if (item.type === 'participant') {
                        if (item.attributes.stats.playerId === this.state.player.id) {

                            const stats = item.attributes.stats;

                            match.winPlace = stats.winPlace;
                            timeSurvivedArray.push(stats.timeSurvived);

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
                            reviveArray.push(stats.revives);
                            // killArray.push(stats.kills);
                            killArray.push(telemetryData.humanKillEvents.length);
                            damageArray.push(stats.damageDealt);
                             **/
                        }
                    }
                }
            );

            matchArray.push( {'overallPoints': match.overallPoints, mapName: mapMap[match.data.attributes.mapName],
                'gameMode': match.data.attributes.gameMode, 'damageDealt': match.damageDealt,
                'humanKills': telemetryData.humanKillEvents.length, 'botKills': telemetryData.botKillEvents.length,
                'humanKnocks': telemetryData.humanKnockEvents.length, 'botKnocks': telemetryData.botKnockEvents.length,
                'winPlace': match.winPlace, 'killPoints': match.killPoints, 'winPoints': match.winPoints,
                'timeSurvived': match.timeSurvived, 'advancedMetrics': advancedMetrics,
                'date': new Date(match['data']['attributes']['createdAt']), 'revives': match.revives, 'id': match['data']['id']} );
        });

        if(matchArray.length > 1){
            matchArray = matchArray.sort( (a,b) => b.date - a.date)
        }

        // total advanced metrics
        let tAM = {
            damageCausers: [],
            damageCauserAmounts: [],
            damageCauserCounts: [],
            damageCauserTypes: [],
            damageCauserTypeAmounts: [],
            damageCauserTypeCounts: []
        };

        matchArray.forEach(match => {
            let metrics = match.advancedMetrics;
            metrics.damageCausers.forEach((damageCauser, index) => {
                if(tAM.damageCausers.indexOf(damageCauser) === -1){
                    tAM.damageCausers.push(damageCauser);
                    tAM.damageCauserCounts.push(0);
                    tAM.damageCauserAmounts.push(0);
                }
                const weaponIndex = tAM.damageCausers.indexOf(damageCauser);
                const amount = metrics.damageCauserAmounts[index];
                const count = metrics.damageCauserCounts[index];
                tAM.damageCauserCounts[weaponIndex] += count;
                tAM.damageCauserAmounts[weaponIndex] += amount;
            });
            metrics.damageCauserTypes.forEach((damageCauserType, index) => {
                if(tAM.damageCauserTypes.indexOf(damageCauserType) === -1){
                    tAM.damageCauserTypes.push(damageCauserType);
                    tAM.damageCauserTypeCounts.push(0);
                    tAM.damageCauserTypeAmounts.push(0);
                }
                const weaponTypeIndex = tAM.damageCauserTypes.indexOf(damageCauserType);
                const amount = metrics.damageCauserTypeAmounts[index];
                const count = metrics.damageCauserTypeCounts[index];

                tAM.damageCauserTypeCounts[weaponTypeIndex] += count;
                tAM.damageCauserTypeAmounts[weaponTypeIndex] += amount;
            })
        });

        // todo: aggregate advanced metrics from matchArray
        this.updateWeaponsAndWeaponTypes(tAM);

        const winCount = matchArray.filter(match => match.winPlace === 1).length;
        const topCount = matchArray.filter(match => match.winPlace <= 5).length;
        const totalRevives = reviveArray.reduce(add,0);
        const totalTimeSurvived = timeSurvivedArray.reduce(add,0);

        // const deathCount = matchArray.filter(match => match.winPlace > 1).length;

        const totalKos = tAM.damageCauserCounts.reduce(add,0);
        const totalDamage = tAM.damageCauserAmounts.reduce(add,0);
        const offenseScore = ((totalKos * 100) + totalDamage)/2;

        const loadedMatchIds = matchArray.map(match => match.id);

        this.setState({matchList: matchArray, offenseScore: offenseScore, matchCount: matchArray.length,
            reviveCount: totalRevives, totalKos: totalKos,totalDamage: totalDamage,winCount: winCount,  topCount: topCount,
            timeSurvived: totalTimeSurvived, loadedMatches: true, loadedMatchIds: loadedMatchIds});
    }

    getMyMatches(){
        let myMatches = this.props.matches;
        // console.log(`total match count is ${myMatches.length}`);
        // console.log(this.props.matches);
        myMatches = myMatches.filter(match => this.state.matchIds.indexOf(match.data.id) > -1);
        // console.log(`my match count is ${myMatches.length}`);
        // console.log(this.state.matchIds);
        return myMatches;
    }

    getMyTelemetryData(match){
        const accountId = this.state.player.id;

        let knockEvents = match.telemetryData.knockEvents;
        knockEvents = knockEvents.filter(event => event.attacker && event.attacker.accountId === accountId);
        knockEvents = knockEvents.filter(event => event.attacker && event.victim && event.attacker.teamId != event.victim.teamId);
        let humanKnockEvents = knockEvents.filter(event => event.victim.accountId.indexOf('ai.') === -1);
        let botKnockEvents = knockEvents.filter(event => event.victim.accountId.indexOf('ai.') === 0);

        let killEvents = match.telemetryData.killEvents;
        killEvents = killEvents.filter(event => event.killer && event.killer.accountId === accountId);
        killEvents = killEvents.filter(event => event.killer && event.victim && event.killer.teamId != event.victim.teamId);
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


        let attackEvents = match.telemetryData.attackEvents;
        // remove team kills
        attackEvents = attackEvents.filter(event => event.attacker && event.victim && event.attacker.teamId != event.victim.teamId);
        let attackedEvents = attackEvents.filter(event => event.victim && event.victim.accountId === accountId);
        attackEvents = attackEvents.filter(event => event.attacker && event.attacker.accountId === accountId);
        // attackEvents = attackEvents.filter(event => event.damage > 0);

        let humanAttackEvents = attackEvents.filter(event => !this.isBot(event.victim.accountId));
        let botAttackEvents = attackEvents.filter(event => this.isBot(event.victim.accountId));


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

        console.log(`bots: ${bots.length} humans: ${humans.length}`);


        let assistEvents = match.telemetryData.killEvents;
        assistEvents = assistEvents.filter(event => event.assistant && event.killer && event.assistant.accountId != event.killer.accountId && event.assistant.accountId === accountId);

        let deathEvents = match.telemetryData.killEvents;
        deathEvents = deathEvents.filter(event => event.victim && event.victim.accountId === accountId);

        return {
            humanAttackEvents: humanAttackEvents,
            botAttackEvents: botAttackEvents,
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
        })[0]['character']['teamId'];

        const teammateCreateEvents = r.data.filter(event => {
            if (event['character'] && event['character']['accountId'] !== accountId && event['character']['teamId'] === playerTeamId && event['_T'] === 'LogPlayerCreate') {
                return true;
            }
        });

        const teammates = teammateCreateEvents.map(event => {return {name: event['character']['name'], accountId: event['character']['accountId'] }});

        this.setState({teammates: this.state.teammates.concat(teammates)});

        r.data.forEach(function(telemetryEvent) {

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

            /**
             if (telemetryEvent['_T'] === 'LogPlayerPosition') {
                        if (telemetryEvent['character']['accountId'] === accountId) {
                            const positionEvent = telemetryEvent['character']['location'];
                            positionEvent['elapsedTime'] = telemetryEvent['elapsedTime']
                            positionEvent['datestamp'] = new Date(telemetryEvent['_D'])
                            if (positionEvent['elapsedTime'] > 0) {
                                positionEvents.push(positionEvent);
                                // console.log(telemetryEvent);
                            }
                        }
                    }


             if (telemetryEvent['_T'] === 'LogVehicleRide') {

                }

             if (telemetryEvent['_T'] === 'LogVehicleLeave') {
                    if (telemetryEvent['character']['accountId'] === accountId) {
                        if (telemetryEvent['vehicle']['vehicleType'] === 'Parachute') {
                            dropTime = new Date(telemetryEvent['_D']);
                        }
                        // console.log(telemetryEvent);
                    }
                }
             **/

        });
        /**

        positionEvents.sort(function(a, b) {
            return a['elapsedTime'] - b['elapsedTime'];
        });


         const filteredPostionEvents = [];

         let afterDrop = false;

         let previousEvent = null;
         positionEvents.forEach(function(positionEvent) {
                if (previousEvent) {
                    const d = Math.sqrt( positionEvent['x'] * positionEvent['x'] + positionEvent['Y'] * positionEvent['y'] );
                    const t = positionEvent['elapsedTime'] - previousEvent['elapsedTime'];
                    let s = d / t;
                    s = s / 100;

                    if (positionEvent['datestamp'] > dropTime) {
                        afterDrop = true;
                    }

                    if (afterDrop) {
                        filteredPostionEvents.push(positionEvent);
                    }

                }
                previousEvent = positionEvent;
            });
         **/

        /**
        const filteredStateEvents = [];
        let previousEvent = null;
        let radiusChanged = true;
        stateEvents.forEach(function(stateEvent) {
            if (previousEvent) {
                if (previousEvent['safeZone']['radius']
                    === stateEvent['safeZone']['radius']) {
                    if (radiusChanged) {
                        radiusChanged = false;
                        filteredStateEvents.push(previousEvent);
                    }
                } else {
                    radiusChanged = true;
                }
            }

            previousEvent = stateEvent;
        });
         **/

        return {/*'stateEvents': filteredStateEvents, 'positionEvents': filteredPostionEvents,*/ 'playerEvents': playerEvents,
            'killEvents': killEvents, 'knockEvents': knockEvents, 'deathEvents': deathEvents, 'attackEvents': attackEvents};
    }

    getAdvancedMetrics(telemetryData) {
        const victims = [];
        const downed = [];

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
                /**
                this.attackCount ++;
                this.ka = this.killCount / this.attackCount;
                **/
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

        /**



        // todo: maybe support bot events


        // todo: maybe support bot events
        telemetryData.humanKillEvents.forEach(event => {

            // update weapons
            const damageCauser = weaponNameMap[event.damageCauserName];

            if(damageCauser === undefined){
                alert(event.damageCauserName);
            }

            if (damageCausers.indexOf(damageCauser) === -1) {
                damageCausers.push(damageCauser);

                damageCauserCounts[damageCausers.indexOf(damageCauser)] = 0;
            }

            damageCauserCounts[damageCausers.indexOf(damageCauser)]++;

            // update weapon types
            const damageCauserType = weaponTypeMap[event.damageCauserName];

            if (damageCauserTypes.indexOf(damageCauserType) === -1) {
                damageCauserTypes.push(damageCauserType);

                damageCauserTypeCounts[damageCauserTypes.indexOf(damageCauserType)] = 0;
            }

            damageCauserTypeCounts[damageCauserTypes.indexOf(damageCauserType)]++;

            // this.killCount ++;
            // this.kd = this.killCount / this.deathCount;
            // this.ka = this.killCount / this.attackCount;


        });
        **/

        telemetryData.deathEvents.forEach(event => {
            /**
            this.deathCount ++;
            this.kd = this.killCount / this.deathCount;
             **/
        });

        /**
        this.state.loadedAdvancedMatchCount++;
        // console.log('loaded advanced data for ' + this.state.loadedAdvancedMatchCount + ' matches of ' + this.state.matches.length );

        if(this.state.loadedAdvancedMatchCount === this.state.matches.length){
            this.setState({weapons: weapons, weaponTypes: weaponTypes, loadedAdvancedMatchCount: this.state.loadedAdvancedMatchCount});
            console.log('the weapon data is loaded');


            const teammateMap = {};
            this.state.teammates.forEach(teammate => {
                if(teammateMap[teammate.name] === undefined){
                    teammateMap[teammate.name] = 1;
                } else {
                    teammateMap[teammate.name]++;
                }
            });

            let teammateCounts = Object.keys(teammateMap).map(teammate => {return {name: teammate, count: teammateMap[teammate]}});
            teammateCounts = teammateCounts.sort((a,b) => {return b.count - a.count});
            console.log(teammateCounts);



        } else {
            // console.log('updated advanced metrics');
        }
        **/
        return {
            damageCausers: damageCausers,
            damageCauserAmounts: damageCauserAmounts,
            damageCauserCounts: damageCauserCounts,
            damageCauserTypes: damageCauserTypes,
            damageCauserTypeAmounts: damageCauserTypeAmounts,
            damageCauserTypeCounts: damageCauserTypeCounts
        };

    }

    updateWeaponsAndWeaponTypes(advancedMetrics){
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

        this.setState({
            weapons: weapons,
            weaponTypes: weaponTypes
        });
    }

    /**
    retrieveAdvancedMatchData(match) {

        const _self = this;

        let telemetryUrl = match['included'].filter(item => item.type === 'asset' && item.attributes.name === 'telemetry')[0].attributes.url;

        axios.get(telemetryUrl).then(r=> {

            const data = this.parseTelemetryData(r);
            const victims = [];
            const downed = [];

            match.downedEvents = [];

            data['attackEvents'].forEach(function (attackEvent) {
                if ( attackEvent.attacker.teamId !== attackEvent.victim.teamId &&
                    attackEvent.damage > 0 ) {
                    if ( victims.indexOf(attackEvent.victim.name) === -1 ) {
                        victims.push(attackEvent.victim.name);
                        _self.attackCount ++;
                        _self.ka = _self.killCount / _self.attackCount;
                    }

                    // update weapons
                    const damageCauser = weaponNameMap[attackEvent.damageCauserName];

                    if (_self.damageCausers.indexOf(damageCauser) === -1) {
                        _self.damageCausers.push(damageCauser);

                        _self.damageCauserAmounts[_self.damageCausers.indexOf(damageCauser)] = 0;
                        _self.damageCauserCounts[_self.damageCausers.indexOf(damageCauser)] = 0;
                    }

                    _self.damageCauserAmounts[_self.damageCausers.indexOf(damageCauser)] += attackEvent.damage;

                    // update weapon types
                    const damageCauserType = weaponTypeMap[attackEvent.damageCauserName];

                    if (_self.damageCauserTypes.indexOf(damageCauserType) === -1) {
                        _self.damageCauserTypes.push(damageCauserType);

                        _self.damageCauserTypeAmounts[_self.damageCauserTypes.indexOf(damageCauserType)] = 0;
                        _self.damageCauserTypeCounts[_self.damageCauserTypes.indexOf(damageCauserType)] = 0;
                    }

                    _self.damageCauserTypeAmounts[_self.damageCauserTypes.indexOf(damageCauserType)] += attackEvent.damage;

                    const remainingHealth = attackEvent.victim.health - attackEvent.damage;

                    if ( remainingHealth === 0 ) {
                        if ( downed.indexOf(attackEvent.victim.name) === -1 ) {
                            downed.push(attackEvent.victim.name);
                            _self.downedCount ++;
                            match.downedEvents.push(attackEvent);
                        }

                    }

                }

            });


            match.downedEvents.forEach(function (killEvent) {

                // update weapons
                const damageCauser = weaponNameMap[killEvent.damageCauserName];

                if (_self.damageCausers.indexOf(damageCauser) === -1) {
                    _self.damageCausers.push(damageCauser);

                    _self.damageCauserCounts[_self.damageCausers.indexOf(damageCauser)] = 0;
                }

                _self.damageCauserCounts[_self.damageCausers.indexOf(damageCauser)]++;

                // update weapon types
                const damageCauserType = weaponTypeMap[killEvent.damageCauserName];

                if (_self.damageCauserTypes.indexOf(damageCauserType) === -1) {
                    _self.damageCauserTypes.push(damageCauserType);

                    _self.damageCauserTypeCounts[_self.damageCauserTypes.indexOf(damageCauserType)] = 0;
                }

                _self.damageCauserTypeCounts[_self.damageCauserTypes.indexOf(damageCauserType)]++;

                _self.killCount ++;
                _self.kd = _self.killCount / _self.deathCount;
                _self.ka = _self.killCount / _self.attackCount;


            });

            // console.log(damageCausers);
            // console.log(damageCauserCounts);

            data['deathEvents'].forEach(function (event) {
                _self.deathCount ++;
                _self.kd = _self.killCount / _self.deathCount;

            });

            const weapons = [];

            for (let i = 0; i < _self.damageCausers.length; i++) {
                const weapon = {
                    'name': _self.damageCausers[i],
                    'kills': _self.damageCauserCounts[i],
                    'damage': _self.damageCauserAmounts[i]
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

            for (let i = 0; i < _self.damageCauserTypes.length; i++) {
                const weaponType = {
                    'name': _self.damageCauserTypes[i],
                    'kills': _self.damageCauserTypeCounts[i],
                    'damage': _self.damageCauserTypeAmounts[i]
                };

                weaponTypes.push(weaponType);
            }

            weaponTypes.sort(function(a, b) {
                if (a.kills === b.kills) {
                    return b.damage - a.damage;
                }
                return b.kills - a.kills;
            });

            _self.state.loadedAdvancedMatchCount++;
            // console.log('loaded advanced data for ' + _self.state.loadedAdvancedMatchCount + ' matches of ' + _self.state.matches.length );

            if(_self.state.loadedAdvancedMatchCount === _self.state.matches.length){
                _self.setState({weapons: weapons, weaponTypes: weaponTypes, loadedAdvancedMatchCount: _self.state.loadedAdvancedMatchCount});
                console.log('the weapon data is loaded');


                const teammateMap = {};
                this.state.teammates.forEach(teammate => {
                    if(teammateMap[teammate.name] === undefined){
                        teammateMap[teammate.name] = 1;
                    } else {
                        teammateMap[teammate.name]++;
                    }
                });

                let teammateCounts = Object.keys(teammateMap).map(teammate => {return {name: teammate, count: teammateMap[teammate]}});
                teammateCounts = teammateCounts.sort((a,b) => {return b.count - a.count});
                console.log(teammateCounts);



            } else {
                // console.log('updated advanced metrics');
            }




        }).catch(e => console.error(e));



    }
    **/
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
