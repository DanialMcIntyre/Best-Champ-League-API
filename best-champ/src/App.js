import './style/App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import { useEffect } from 'react';

function App() {

  //Text box
  const [searchText, setSearchText] = useState("");
  const [numGames, setNumGames] = useState("");

  //Player data
  var [playerData, setPlayerData] = useState({})
  //Player rank
  var [playerRank, setPlayerRank] = useState({})
  //List of matches with details
  var [matchData, setMatchData] = useState({})
  //Status
  var [resStatus, setResStatus] = useState(0)

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

  //Best champ related
  const bestChamp = React.useRef();
  const bestChampNumMatches = React.useRef();
  const bestChampMatch = React.useRef();
  const bestChampWins = React.useRef();
  const bestChampLosses = React.useRef();
  const bestScore = React.useRef([]);
  const otherChamps = React.useRef([]);
  
  //Highlight game related
  const playerNames = React.useRef([]);
  const playerChamps = React.useRef([]);
  const playerKDAs = React.useRef([]);
  const playerCS = React.useRef([]);
  const playerWards = React.useRef([]);
  const playerWin = React.useRef();
  const gameLength = React.useRef();
  const startTime = React.useRef([]);

  //When user searches for player
  function onButtonClick(event) {
    bestChamp.current = undefined;
    setPlayerData([])
    setMatchData([])
    setPlayerRank([])
    setResStatus(0)
    getPlayerData()
    getPlayerRank()
    getMatchData()
  }

  //Finds player data
  function getPlayerData() {
    axios.get("http://localhost:4000/playerData", { params: {username: searchText}})
    .then(function (response) {
      setResStatus(response.status);
      setPlayerData(response.data);
    }).catch(function (error) {
      setResStatus(error.response.status);
      console.log(error);
    })
  }

  function getPlayerRank() {
    axios.get("http://localhost:4000/playerRank", { params: {username: searchText}})
    .then(function (response) {
      setResStatus(response.status);
      setPlayerRank(response.data);
    }).catch(function (error) {
      setResStatus(error.response.status);
      console.log(error);
    })
  }

  //Gets match details of past games
  async function getMatchData() {
    axios.get("http://localhost:4000/matchHistory", { params: {username: searchText, num: numGames}})
      .then(function (response) {
        setResStatus(response.status);
        setMatchData(response.data);
      }).catch(function (error) {
        setResStatus(error.response.status);
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

      let deathsPoints = 0.5 * deaths.current[i]

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
        if(win.current[i]) {
          value[2] = newValue[2] + 1
        } else {
          value[2] = newValue[2]
        }
        dict[champions.current[i]] = value;
      } else {
        value[0] = points;
        value[1] = 1;
        if(win.current[i]) {
          value[2] = 1;
        } else {
          value[2] = 0;
        }
        dict[champions.current[i]] = value;
      }
    }

    let highestScore = 0;

    let count = 0;
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
      otherChamps.current[count] = {name: currentChamp, score: value[0], games: value[1], wins: value[2]}
      bestScore.current[count] = (Math.round(value[0]) / 100).toFixed(2)
      count++;
    }
    otherChamps.current.sort(function(a,b) {
      return b.score - a.score
    });
    bestScore.current.sort().reverse();
    
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
    otherChamps.current.splice(0, 1);
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

    if (matchData.length !== undefined && bestChamp.current !== undefined) {

      for (var i = 0; i < 10; i++) {
        playerChamps.current[i] = matchData[bestChampMatch.current].info.participants[i].championName;
        playerNames.current[i] = matchData[bestChampMatch.current].info.participants[i].summonerName;

        var kills = matchData[bestChampMatch.current].info.participants[i].kills;
        var deaths = matchData[bestChampMatch.current].info.participants[i].deaths;
        var assists = matchData[bestChampMatch.current].info.participants[i].assists;

        playerKDAs.current[i] = kills + "/" + deaths + "/" + assists;

        playerCS.current[i] = matchData[bestChampMatch.current].info.participants[i].totalMinionsKilled;
        playerWards.current[i] = matchData[bestChampMatch.current].info.participants[i].wardsPlaced;
        
      }

      if (matchData[bestChampMatch.current].info.participants[number.current[bestChampMatch.current]].win) {
        playerWin.current = "Victory";
      } else {
        playerWin.current = "Defeat";
      }

      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var temp = new Date(matchData[bestChampMatch.current].info.gameCreation)
      startTime.current = months[temp.getMonth()] + " " + temp.getDate();

      temp = matchData[bestChampMatch.current].info.gameDuration;
      var minutes = Math.floor(temp / 60);
      var seconds = temp - minutes * 60;
      gameLength.current = minutes + " minutes " + seconds + " seconds";
    
    }

  }

  //Runs on every page re-render
  useEffect(() => {
    console.log(resStatus);
    }, [playerData, playerRank, matchData, resStatus]); 

  getPlayerDataFromMatches()
  findBestChamp();
  bestChampStats();
  highlightGame();

  //Puts info into variables
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

      <h1>Your Best Champion Is: {bestChamp.current}</h1>
      <h2>Your Best Score Is: {(bestScore.current[0] * 100).toFixed(0)}%</h2>
      <p>You have {bestChampWins.current} wins and {bestChampLosses.current} losses with a {(bestChampWins.current / bestChampNumMatches.current * 100).toFixed(2)}% winrate</p>

      <h1>Highlight game:</h1>
      <h2>{playerWin.current}</h2>
      <h3>Match played on {(startTime.current)}</h3>
      <h3>Game duration {(gameLength.current)}</h3>

      <div className='rounded-corner-green'>


        <div className='rounded-corner-blue'>
          <h2> {playerChamps.current[0]} ({playerNames.current[0]}) {playerKDAs.current[0]}</h2>
          <p>CS: {playerCS.current[0]} Wards placed: {playerWards.current[0]}</p>
          <h2> {playerChamps.current[1]} ({playerNames.current[1]}) {playerKDAs.current[1]}</h2>
          <p>CS: {playerCS.current[1]} Wards placed: {playerWards.current[1]}</p>
          <h2> {playerChamps.current[2]} ({playerNames.current[2]}) {playerKDAs.current[2]}</h2>
          <p>CS: {playerCS.current[2]} Wards placed: {playerWards.current[2]}</p>
          <h2> {playerChamps.current[3]} ({playerNames.current[3]}) {playerKDAs.current[3]}</h2>
          <p>CS: {playerCS.current[3]} Wards placed: {playerWards.current[3]}</p>
          <h2> {playerChamps.current[4]} ({playerNames.current[4]}) {playerKDAs.current[4]}</h2>
          <p>CS: {playerCS.current[4]} Wards placed: {playerWards.current[4]}</p>
        </div>

        <div className='rounded-corner-red'>
          <h2> {playerChamps.current[5]} ({playerNames.current[5]}) {playerKDAs.current[5]}</h2>
          <p>CS: {playerCS.current[5]} Wards placed: {playerWards.current[5]}</p>
          <h2> {playerChamps.current[6]} ({playerNames.current[6]}) {playerKDAs.current[6]}</h2>
          <p>CS: {playerCS.current[6]} Wards placed: {playerWards.current[6]}</p>
          <h2> {playerChamps.current[7]} ({playerNames.current[7]}) {playerKDAs.current[7]}</h2>
          <p>CS: {playerCS.current[7]} Wards placed: {playerWards.current[7]}</p>
          <h2> {playerChamps.current[8]} ({playerNames.current[8]}) {playerKDAs.current[8]}</h2>
          <p>CS: {playerCS.current[8]} Wards placed: {playerWards.current[8]}</p>
          <h2> {playerChamps.current[9]} ({playerNames.current[9]}) {playerKDAs.current[9]}</h2>
          <p>CS: {playerCS.current[9]} Wards placed: {playerWards.current[9]}</p>
        </div>

      </div>

    </div>
    )
  }

  function SideChamp(props) {
    return (
      <div id="sideChamp-container">
        <div id="place">{props.place}</div>
        <img src={"http://ddragon.leagueoflegends.com/cdn/13.13.1/img/champion/" + props.name + ".png"} alt="Your second best" id="sidechampimg" display="flex"/>
        <div>{props.name}</div>
        <div id="infobox">
          <div>{(props.wins/props.games*100).toFixed(2)}% Winrate ({props.games} Games)</div>
          <div>Number of games: {props.games}</div>
          <div>Number of wins: {props.wins}</div>
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

          <div className="mid">
            <MainStat></MainStat>
          </div>

          <div id="midspacer"></div>
          <div className="scrollable-box">
            <div className="content">
              {otherChamps.current.map((item,index)=>{
            return <SideChamp key={index} name={otherChamps.current[index].name} place={(bestScore.current[index + 1] * 100).toFixed(0) + "%"} games={otherChamps.current[index].games} wins={otherChamps.current[index].wins}></SideChamp>
              })}
            </div>
          </div>
        </div>
        
        <div id="midspacer"></div>

      </div>
    )
  }
  
  return (
    <div>
      <div className="App">
        <div className="content">
          <div className="top">
            <div className = "title">
              <h1>Best Champion Finder!</h1>
            </div>
            <div className="userInput">
              <input type="text" className="search" onChange = {e => setSearchText(e.target.value)} onKeyDown = {e => handleKeyDown(e)}/>
              <button className="button"onClick = {e => onButtonClick(e)}>Search for player</button>
              <p className="labelGames">Number of games</p>
              <input type="number" className="number-input" placeholder={20} value={numGames} onChange={(e) => setNumGames(parseInt(e.target.value))} min={10} max= {50}/>
            </div>
          </div>
          {
          //If search was successful
          JSON.stringify(bestChamp.current) !== undefined ?
          <Analytics/>
          : //IF rate limit was reached
          JSON.stringify(resStatus) === "429" ?
          <div className="error">
            <h1>Rate limit reached. Please try again later.</h1>
          </div>
          :
          resStatus === 600 ?
          <div className="error">
            <h1>No matches found!</h1>
          </div>    
          : //Other error
          resStatus !== 200 && resStatus !== 0 ?
          <div className="error">
            <h1>API Call Error. Failed with status code {resStatus}. Try another username!</h1>
          </div>
          : //When searching the API
          JSON.stringify(playerData) !== '{}' ?
          <>
          <br/>
          <h1>Loading...</h1>
          <img src={require('./images/loading.gif')} alt="loading..." />
          </>
          : //Else
          <>
          <br/>
          <h1>No player data</h1>
          </>
          }
        </div>
        <br />
      </div>
    </div>
  );
  
}

export default App;
