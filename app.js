import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 5000;

const allTweets = [];
const usersSignedUp = [];

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});


function getTweetsFromUser(user) {
    return allTweets.filter(tweet => tweet.username == user);
}

function getAvatarFromUser(userFind) {
    return usersSignedUp.find(user => user.username == userFind).avatar;
}

app.get('/tweets', (req, res) => {

    const page = parseInt(req.query.page);

    if (allTweets.length == 0) {
        res.status(200).send([]);
        return;
    }

    if (page && page <= 0) {
        res.status(400).send('Informe uma página válida!');
    }
    else {

        if (page === 1) {
            console.log('Requested page 1 of tweets');

            if (allTweets.length <= 10) {
                const finalResponse = [...allTweets].reverse();
                finalResponse.forEach(tweet => {
                    tweet.avatar = getAvatarFromUser(tweet.username);
                });
                res.status(200).send(finalResponse);
                console.log('Responded with all of tweets because we dont have more than 10 tweets');
            }
            else {
                const finalResponse = [...allTweets].reverse().slice(0, 9);
                finalResponse.forEach(tweet => {
                    tweet.avatar = getAvatarFromUser(tweet.username);
                });
                res.status(200).send(finalResponse);
                console.log('Responded with tweets between 0 and 9');
            }
        }
        else {
            let startSlice = (page - 1) * 10;
            let endSlice = startSlice + 10;

            if (startSlice > allTweets.length) {
                res.status(200).send([]);
                console.log(`Responded with empty array because the page index requested (${page}) doesn't have any tweets!`);
                return;
            }

            if (endSlice > allTweets.length) {
                endSlice = allTweets.length;
            }

            console.log(`Responded with tweets between ${startSlice} and ${endSlice}`);

            const finalResponse = allTweets.slice(startSlice, endSlice).reverse();
            finalResponse.forEach(tweet => {
                tweet.avatar = getAvatarFromUser(tweet.username);
            });
            res.status(200).send(finalResponse);
        }
    }
});

// USER TWEETS by ID

app.get('/tweets/:id', (req, res) => {

    console.log(`User ${req.params.id} requested all of his tweets`);
    const response = getTweetsFromUser(req.params.id);
    res.send(response);
});


// SING UP

app.post('/sign-up', (req, res) => {
    if (usersSignedUp.find(user => user.username == req.body.username) == undefined) {
        if (req.body.username == "" || req.body.username == undefined || req.body == undefined || req.body.avatar == "" || req.body.avatar == undefined || typeof req.body.avatar != 'string' || typeof req.body.username != 'string') {
            res.status(400).send('Todos os campos são obrigatórios!')
        }
        else {
            usersSignedUp.push(req.body);
            res.status(201).send('OK');
        }
    }
    else {
        res.status(401).send('UNAUTHORIZED');
    }
});

// POST TWEET

app.post('/tweets', (req, res) => {

    if(!req.body || !req.body.tweet || req.body.tweet == '')
    {
        res.sendStatus(400);
    }
    

    const newTweet = req.body;
    const tweetFrom = req.headers.user;

    if (usersSignedUp.find(user => user.username == tweetFrom) == undefined) {
        res.status(401).send('UNAUTHORIZED');
    }
    else {
        allTweets.push({ username: tweetFrom, tweet: newTweet.tweet });
        res.status(201).send('OK');
    }
});