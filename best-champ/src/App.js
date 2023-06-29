import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import { useEffect } from 'react';

function App() {

  //Text box
  const [searchText, setSearchText] = useState("");

  //Player data
  var [playerData, setPlayerData] = useState({})
  //List of matches with details
  var [matchData, setMatchData] = useState({})

  //Data from matches
  const champions = React.useRef([])
  const roles = React.useRef([])
  const kills = React.useRef([])
  const deaths = React.useRef([])
  const assists = React.useRef([])
  const cs = React.useRef([])
  const win = React.useRef([])
  const vision = React.useRef([])

  const bestChamp = React.useRef();

  //When user searches for player
  function onButtonClick(event) {
    setPlayerData([])
    setMatchData([])
    getPlayerData()
    getMatchData()
  }

  //Finds player data
  function getPlayerData() {
    axios.get("http://localhost:4000/playerData", { params: {username: searchText}})
    .then(function (response) {
      setPlayerData(response.data);
    }).catch(function (error) {
      console.log(error);
    })
  }

  //Gets match details of past games
  async function getMatchData() {
    axios.get("http://localhost:4000/matchHistory", { params: {username: searchText}})
      .then(function (response) {
        setMatchData(response.data);
      }).catch(function (error) {
        console.log(error);
      })
  }

  //Gets specific stats from past games
  function getPlayerDataFromMatches() {
    if (matchData.length !== undefined) {
      const numOfMatches = matchData.length;
      const puuid = playerData.puuid;

      //Player info from games
      let playerNumber = [];
      let playerChamps = [];
      let playerRoles = [];
      let playerKills = [];
      let playerDeaths = [];
      let playerAssists = [];
      let playerCS = [];
      let playerWin = [];
      let playerVision = [];

      //Find player position in list of players (ex: 3 of 10)
      for (let i = 0; i < numOfMatches; i++) {
        for (let n = 0; n < 10; n++) {
          if (matchData[i].metadata.participants[n] === puuid) {
            playerNumber.push(n);
          }
        }
      }

      //Finds players previous played champions from recent games
      for (let i = 0; i < numOfMatches; i++) {
        let champ = matchData[i].info.participants[playerNumber[i]].championName
        playerChamps.push(champ);
      }
      champions.current = playerChamps;

      //Finds players roles from recent games
      for (let i = 0; i < numOfMatches; i++) {
        let role = matchData[i].info.participants[playerNumber[i]].lane
        playerRoles.push(role);
      }
      roles.current = playerRoles;

      //Finds players KDA from recent games      
      for (let i = 0; i < numOfMatches; i++) {
        let k = matchData[i].info.participants[playerNumber[i]].kills
        playerKills.push(k);
        let d = matchData[i].info.participants[playerNumber[i]].deaths
        playerDeaths.push(d);
        let a = matchData[i].info.participants[playerNumber[i]].assists
        playerAssists.push(a);
      }
      kills.current = playerKills;
      deaths.current = playerDeaths;
      assists.current = playerAssists;

      //Finds players cs from recent games
      for (let i = 0; i < numOfMatches; i++) {
        let cs = matchData[i].info.participants[playerNumber[i]].totalMinionsKilled
        playerCS.push(cs);
      }
      cs.current = playerCS;

      //Finds if player wins or not
      for (let i = 0; i < numOfMatches; i++) {
        let win = matchData[i].info.participants[playerNumber[i]].win
        playerWin.push(win);
      }
      win.current = playerWin;

      //Finds if player vision score from games
      for (let i = 0; i < numOfMatches; i++) {
        let vision = matchData[i].info.participants[playerNumber[i]].visionScore
        playerVision.push(vision);
      }
      vision.current = playerVision;
    }
  }

  function findBestChamp() {

    //Dictionary will hold all played champions alongside their point score and number of times it was played
    var dict = {}

    for(let i = 0; i < matchData.length; i++) {
      //This will store the score of the champion, alongside the amount of times it was played
      var value = [];

      //Calculate points
      let points = 0;

      let csPoints = Math.floor(cs.current[i] / 50)
      if (csPoints > 10) {
        csPoints = 10
      }

      let killsPoints = kills.current[i]
      if (killsPoints > 15) {
        killsPoints = 15
      }
      
      let assistsPoints = 0.5 * assists.current[i]
      if (assistsPoints > 15) {
        assistsPoints = 15
      }

      let deathsPoints = 0.5 * deaths.current[i]
      if (deathsPoints > 5) {
        deathsPoints = 5
      }

      if (win.current[i]) {
        points += 5
      }

      let visionPoints = 0.1 * vision.current[i]
      if (visionPoints > 10) {
        visionPoints = 10
      }

      points = csPoints + killsPoints + assistsPoints - deathsPoints + visionPoints;

      //Add points to dictionary
      if (champions.current[i] in dict) {
        let newValue = dict[champions.current[i]]
        newValue[1]++;
        value[0] = points + newValue[0];
        value[1] = newValue[1];
        dict[champions.current[i]] = value;
      } else {
        value[0] = points;
        value[1] = 1;
        dict[champions.current[i]] = value;
      }
    }

    let highestScore = 0;
    for (var key in dict) {

      let currentChamp = key
      let value = dict[currentChamp]
      switch(value[1]) {
        case 1:
          value[0] *= 0.75;
          break;
        case 2:
          value[0] *= 1.2;
          break;
        case 3: 
          value[0] *= 1.3;
          break;
        case 4:
          value[0] *= 1.4;
          break;
        case 5:
          value[0] *= 1.5;
          break;
        default:
          value[0] *= 1.5;
          break; 
      }
      value[0] = Math.round((value[0] / value[1]) * 100) / 100;
      dict[currentChamp] = value;

      if (highestScore < value[0]) {
        highestScore = value[0]
        bestChamp.current = currentChamp;
        console.log(currentChamp + " " + highestScore)
      }
    }
    
    console.log(dict);
  }

  //Runs on every page re-render
  useEffect(() => {
    console.log(playerData);
    console.log(matchData);
    }, [playerData, matchData]); 

  getPlayerDataFromMatches()
  findBestChamp();

  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name
  let iconID = playerData.profileIconId;
  if (iconID === undefined) {
    iconID = 0;
  }
  var skinNumber = 0;
  let iconString = "http://ddragon.leagueoflegends.com/cdn/13.11.1/img/profileicon/" + iconID + ".png"
  let imgString = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + bestChamp.current + "_" + skinNumber + ".jpg"

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      onButtonClick(event);
    }
  }
  function Profile() {
    return (
      <div className="flex-playerinfo rounded-corner" width="100%"> 
        <img src={iconString} alt="Your icon" id="iconImg" display="flex"  />
        <div className=''>
          <p display="flex" id="playername">{playerName}</p> 
          <p display="flex" id="playerrank">Platinum IV</p> 
        </div>
      </div>
    )
  }

  function MainStat() {
    return (
    <div className='rounded-corner'>

    </div>
    )
  }

  function SideChamp() {
    return (
      <div className='rounded-corner'>
  
      </div>
    )
  }

  function Analytics() {

    return (
      <div className="flex-container">
        <div id="midspacer"></div>
        <div className="spacer"></div>
        <div className="child1">
          <Profile></Profile>
          <img width="100%" src={imgString} alt="Your best champion" id="champImg" display="inline"/>
        </div>
        <div id="midspacer"></div>
        <div className='middle'>
          <MainStat></MainStat>
        </div>
        
        <div id="midspacer"></div>
        <div className='side'> 
          <SideChamp></SideChamp>
          <SideChamp></SideChamp>
        </div>
        <div id="midspacer"></div>

      </div>
    )
  }
  
  return (
    <div>
      <div className="bg">
      <div className="App">
        <div className="content">
          <div className = "font-face-league">
            <div className = "title">
              <h1>Best Champion Finder!</h1>
            </div>
            <input type="text" onChange = {e => setSearchText(e.target.value)} onKeyDown = {e => handleKeyDown(e)}/>
            <button onClick = {e => onButtonClick(e)}>Search for player</button>

            <div>
              {
              JSON.stringify(playerData.status) === "404" ?
              <>
              <p>Please enter a valid username!</p>
              </>
              :
              JSON.stringify(playerData) !== '{}' ?
              <Analytics/>
              :
              <><p>No player data</p></>}
            </div>
            <br />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
  
}

export default App;
