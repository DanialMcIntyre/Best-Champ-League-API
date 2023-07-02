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
  //Player rank
  var [playerRank, setPlayerRank] = useState({})
  //List of matches with details
  var [matchData, setMatchData] = useState({})

  //Data from matches
  const number = React.useRef([]) //Player index in match list
  const champions = React.useRef([])
  const roles = React.useRef([])
  const kills = React.useRef([])
  const deaths = React.useRef([])
  const assists = React.useRef([])
  const cs = React.useRef([])
  const win = React.useRef([])
  const vision = React.useRef([])
  const numWins = React.useRef([])
  const numLoss = React.useRef([])

  const bestChamp = React.useRef();
  const bestChampNumMatches = React.useRef();
  const bestChampMatch = React.useRef();
  const bestChampWins = React.useRef();
  const bestChampLosses = React.useRef();
  const otherChamps = React.useRef([]);

  //When user searches for player
  function onButtonClick(event) {
    bestChamp.current = undefined;
    setPlayerData([])
    setMatchData([])
    setPlayerRank([])
    getPlayerData()
    getPlayerRank()
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

  function getPlayerRank() {
    axios.get("http://localhost:4000/playerRank", { params: {username: searchText}})
    .then(function (response) {
      setPlayerRank(response.data);
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
      number.current = playerNumber;

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

      //Finds number of general wins and losses
      for (let i = 0; i < numOfMatches; i++) {
        if (playerWin[i]) {
          numWins.current++;
        }
      }
      numLoss.current = numOfMatches - numWins.current;

    }


  }

  function findBestChamp() {

    //Dictionary will hold all played champions alongside their point score and number of times it was played
    var dict = {}
    
    var pointsPerMatch = [];

    for(let i = 0; i < matchData.length; i++) {
      //This will store the score of the champion, alongside the amount of times it was played
      var value = [];

      //Calculate points
      let points = 0;
      let gameDuration = Math.floor(matchData[i].info.gameDuration/60)
      
      let csPoints = Math.round(cs.current[i]/gameDuration)
      if (csPoints > 10) {
        csPoints = 10
      }

      let killsPoints = 0.8*kills.current[i]
      if(gameDuration < 20 && killsPoints > 15) {
        killsPoints = 15
      } else if (killsPoints > 20) {
        killsPoints = 20
      }

      let assistsPoints = 0.5 * assists.current[i]

      let deathsPoints = 0.7 * deaths.current[i]

      if (win.current[i]) {
        points += 5
      }

      let visionPoints = 0.2 * vision.current[i]

      //Add up points
      points = csPoints + killsPoints + assistsPoints - deathsPoints + visionPoints;
      pointsPerMatch.push(points);

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
    otherChamps.current = [{name: "default", score: -100}, {name: "default", score: -100}, {name: "default", score: -100}, {name: "default", score: -100}, {name: "default", score: -100}]
    for (var key in dict) {
      let currentChamp = key

      let value = dict[currentChamp]
      value[0] = Math.round((value[0] / value[1]) * 100) / 100;
      value[0] *= (Math.log(value[1]) + 0.25)
      dict[currentChamp] = value;

      if (highestScore < value[0]) {
        highestScore = value[0]
        bestChamp.current = currentChamp;
      }
      for(let i = 0; i < 5; i++) {
        if (value[0] > otherChamps.current[i].score) {
          otherChamps.current.splice(i, 0, {name: currentChamp, score: value[0]})
          otherChamps.current.pop()
          break
        }
      }
    }
    
    let highestPoints = 0;
    let currentHighestMatch = 0;
    for (var i = 0; i < matchData.length; i++) {
      if (matchData[i].info.participants[number.current[i]].championName === bestChamp.current) {
        if (pointsPerMatch[i] > highestPoints) {
          highestPoints = pointsPerMatch[i];
          currentHighestMatch = i;
        }
      }
    }
    bestChampMatch.current = currentHighestMatch;
  }

  function bestChampStats() {

    if (matchData.length !== undefined) {
      const numOfMatches = matchData.length;

      let numGames = 0;
      let numWins = 0;

      //Finds number of games on best champ
      for (let i = 0; i < numOfMatches; i++) {
        if (matchData[i].info.participants[number.current[i]].championName === bestChamp.current) {
            numGames++;
        }
      }
      bestChampNumMatches.current = numGames;

      //Finds number of win on best champ
      for (let i = 0; i < numOfMatches; i++) {
        if (win.current[i] && matchData[i].info.participants[number.current[i]].championName === bestChamp.current) {
            numWins++;
        }
      }
      bestChampWins.current = numWins;
      bestChampLosses.current = numGames - numWins;

    }
  }

  function highlightGame() {

    var bestMatch = matchData[bestChampMatch];

  }

  //Runs on every page re-render
  useEffect(() => {
    console.log(playerData);
    }, [playerData, playerRank, matchData]); 

  getPlayerDataFromMatches()
  findBestChamp();
  bestChampStats();

  //Puts info into variables
  //var playerID = playerData.id
  //var playerPUUID = playerData.puuid
  var playerName = playerData.name
  var pRank;
  var wRatio;
  try {
    pRank = playerRank[0].tier
    pRank = pRank.toLowerCase()
    pRank = pRank.charAt(0).toUpperCase() + pRank.slice(1)
    pRank += " " + playerRank[0].rank + " - " + playerRank[0].leaguePoints + "LP"
    wRatio = playerRank[0].wins + "W / " + playerRank[0].losses + "L"
  } catch {
    pRank = ""
    wRatio = ""
  }
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
        <div className='info'>
          <div id="playername">{playerName}</div> 
          <div id="playerrank">{pRank}</div> 
          <div id="playerrank">{wRatio}</div> 
        </div>
      </div>
    )
  }

  function MainStat() {
    return (
    <div className='rounded-corner'>

      <p>Your Best Champion Is: {bestChamp.current}</p>
      <p>You have {bestChampWins.current} wins</p>
      <p>You have {bestChampLosses.current} losses</p>
      <p>Your winrate is {bestChampWins.current / bestChampNumMatches.current * 100}%</p>
      <p>Your best game is game {bestChampMatch.current}</p>

      <div className='rounded-corner-green'>

        <div className='rounded-corner-blue'>
          <p>
          </p>
        </div>

        <div className='rounded-corner-red'>

        </div>

      </div>

    </div>
    )
  }

  function SideChamp(props) {
    return (
      <div className='rounded-corner' id="sideChamp-container">
        <div id="place">{props.place}</div>
        <img src={"http://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/"+props.name+".png"} alt="Your second best" id="sidechampimg" display="flex"/>
        <div>{props.name}</div>
        <div id="infobox">
          <div> Winrate: </div>
          <div> Average Kills: </div>
          <div> Average Gold: </div>
          </div>
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
          <div id="image-container"><img src={imgString} alt="Your best champion" id="champImg" /></div>
        </div>
        <div id="midspacer"></div>
        <div className='middle'>
          <MainStat></MainStat>
        </div>
        
        <div id="midspacer"></div>
        <div className='side'> 
          <SideChamp name={otherChamps.current[1].name} place="2nd" id="2"></SideChamp>
          <SideChamp name={otherChamps.current[2].name} place="3rd" id="3"></SideChamp>
          <SideChamp name={otherChamps.current[3].name} place="4th" id="4"></SideChamp>
          <SideChamp name={otherChamps.current[4].name} place="5th" id="5"></SideChamp>
        </div>
        <div id="midspacer"></div>

      </div>
    )
  }
  
  return (
    <div>
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
              JSON.stringify(bestChamp.current) !== undefined ?
              <Analytics/>
              :
              JSON.stringify(playerData) !== '{}' ?
              <>
              <p>Loading...</p>
              </>
              :
              <><p>No player data</p></>}
            </div>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default App;
