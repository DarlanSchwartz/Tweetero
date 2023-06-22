import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});


const allTweets = [];
const usersLoggedIn = [];
const usersSignedUp = [];

function getTweetsFromUser(user) {
    return allTweets.filter(tweet => tweet.username == user);
}

function getAvatarFromUser(userFind) {
    return usersSignedUp.find(user => user.username == userFind).avatar;
}

app.get('/tweets', (req, res) => {

    const page = parseInt(req.query.page);
    if (!page || page <= 0) {
        res.status(400).send('Informe uma página válida!');
    }
    else {
        const limit = 10;
        const searchTweet = allTweets.length - page * limit;
        const firstTweet = (page - 1) * limit;

        let sliceStart;
        let sliceEnd;

        if (allTweets.length <= limit) 
        {
            sliceStart = 0;
        }
        else 
        {
            if (searchTweet < 0) 
            {
                sliceStart = 0;
            } 
            else 
            {
                sliceStart = searchTweet;
            }
        }

        
        if (firstTweet > allTweets.length) 
        {
            sliceEnd = 0;
        }
        else 
        {
            if (sliceStart === 0) 
            {
                sliceEnd = allTweets.length - firstTweet;
            } 
            else 
            {
                sliceEnd = sliceStart + limit;
            }
        }
        const finalResponse = allTweets.slice(sliceStart, sliceEnd).reverse();
        finalResponse.forEach(tweet => {
            tweet.avatar = getAvatarFromUser(tweet.username);
        });

        console.log(finalResponse.length);
        console.log(page);
        res.status(200).send(finalResponse);
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




