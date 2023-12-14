var express = require('express');
var cors = require('cors');
const axios = require('axios');
require('dotenv').config();

var app = express();

app.use(cors());

const API_KEY = process.env.API_KEY;

//Gets player data
function getPlayerData(playerName) {
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + playerName + "?api_key=" + API_KEY;  
    return axios.get(link)
        .then(response => {
            return response;
        }).catch(err => {
            return err.response;
        });
}

//Get player data
app.get('/playerData', async (req, res) => {
    const searchName = req.query.username;
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + searchName + "?api_key=" + API_KEY;  
    await axios.get(link)
        .then(response => {
            return res.json(response.data)
        })
        .catch(err => {
            const status = err.response.status
            if(status === 429) {
                return res.status(status).send("Rate limit reached!");
            } else {
                console.log("1: " + status);
                return res.status(status).send("API Call error. Status code: " + status);
            }
        });
})

app.get('/playerRank', async (req, res) => {
    const player = await getPlayerData(req.query.username);
    if (player.status === 404) {
        return res.status(player.status).send("Player doesn't exist!")
    }
    const id = player.data.id;
    const link = "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + id + "?api_key=" + API_KEY;  
    await axios.get(link)
        .then(response => {
            return res.json(response.data);
        })
        .catch(err => {
            const status = err.response.status
            if(status === 429) {
                return res.status(status).send("Rate limit reached!");
            } else {
                console.log("2: " + status);
                return res.status(status).send("API Call error. Status code: " + status);
            }
        });
})

//Get list of matches and details
app.get('/matchHistory', async (req, res) => {
    const player = await getPlayerData(req.query.username);
    if (player.status === 404) {
        return res.status(player.status).send("Player doesn't exist!")
    }
    const puuid = player.data.puuid;
    const numberOfGames = req.query.num;
    const link1 = "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?start=0&count=" + numberOfGames + "&api_key=" + API_KEY + "&queue=420";
    const matchIDList = await axios.get(link1)
        .then(response => response.data)
        .catch(err => {
            const status = err.response.status;
            if(status === 429) {
                return res.status(status).send("Rate limit reached!");
            } else {
                console.log("3: " + status);
                return res.status(status).send("API Call error. Status code: " + status);
            }
        });

    if (matchIDList.length === 0) {
        return res.status(600).send("No matches found!");
    }
    console.log(matchIDList.length)
    let matchListDetails = []
    for (let i = 0; i < matchIDList.length; i++) {
        const link2 = "https://americas.api.riotgames.com/lol/match/v5/matches/" + matchIDList[i] + "?api_key=" + API_KEY;
        await axios.get(link2)
            .then(response => { 
                matchListDetails.push(response.data);
            })
            .catch(err => {
                const status = err.response.status;
                if(status === 429) {
                    return res.status(status).send("Rate limit reached!");
                } else {
                    console.log("4: " + status);
                    return res.status(status).send("API Call error. Status code: " + status);
                }
            });
    }
    return res.json(matchListDetails);
});

app.listen(4000, function () {
    console.log("Server started on port 4000");
});