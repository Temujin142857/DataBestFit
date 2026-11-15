import { readdir } from 'node:fs/promises';
import path from 'node:path';
const fs = require('node:fs');

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/users', (req, res) => {
    const line=req.body.line
    
    res.send('Retrieve all users');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

async function loadLines(directory){
    for (const name of await readdir(directory)) {
        console.log(path.join(directory, name));
        fs.readFile(directory, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data);
        });
    }
}



function compareLines(){

}
