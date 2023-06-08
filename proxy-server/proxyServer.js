var express = require('express');
var cors = require('cors');
const axios = require('axios');

var app = express();

app.use(cors());

const API_KEY = "RGAPI-ee7019a5-37ce-4816-8e8c-31e5785d3dc6";

//Gets player puuid
function getPlayerPUUID(playerName) {

    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + playerName + "?api_key=" + API_KEY;  
    return axios.get(link)
        .then(response => {
            return response.data.puuid;
        }).catch(err => err);
}

//Get player data
app.get('/playerData', async (req, res) => {
    const searchName = req.query.username;
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + searchName + "?api_key=" + API_KEY;  
    const playerData = await axios.get(link)
        .then(response => response.data)
        .catch(err => err);
    
    res.json(playerData);
})

//Get list of matches and details
app.get('/matchHistory', async (req, res) => {
    const puuid = await getPlayerPUUID(req.query.username);
    const numberOfGames = 10;
    const link1 = "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?start=0&count=" + numberOfGames + "&api_key=" + API_KEY;
    const matchIDList = await axios.get(link1)
        .then(response => response.data)
        .catch(err => err);

    let matchListDetails = []
    for (let i = 0; i < matchIDList.length; i++) {
        const link2 = "https://americas.api.riotgames.com/lol/match/v5/matches/" + matchIDList[i] + "?api_key=" + API_KEY;
        const details = await axios.get(link2)
            .then(response => response.data)
            .catch(err => err);
            matchListDetails.push(details);
    }

    res.json(matchListDetails);
});

app.listen(4000, function () {
    console.log("Server started on port 4000");
});