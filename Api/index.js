import { readdir } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
const app = express();
const port = 5002;

const DIRECTORY="C:\Users\Temuj\Programming\DataBestFit\Data"


app.use(express.json());

app.get('/api/users', (req, res) => {
    const line=req.body.line
    const bestFit=loadLines(line)    
    res.send(bestFit);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

function cleanLine(line){
    let vector={}
    vector["direction"]=Math.atan((line.p2.y-line.p1.y)/(line.p2.x-line.p1.x))
    vector["magnitude"]=Math.sqrt(((line.p2.y-line.p1.y)**2)+((line.p2.x-line.p1.x)**2))
    return vector
}

async function loadLines(line){
    let bestFit={"fitValue": Number.MIN_VALUE}
    for (const name of await readdir(DIRECTORY)) {
        console.log(path.join(DIRECTORY, name));
        fs.readFile(path.join(DIRECTORY, name), 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data);
            const thisSet=interpretData(data)
            thisSet["fitValue"]=vectorMetric(thisSet["line"], line)
            if(bestFit["fitValue"]<thisSet["fitValue"]){
                bestFit=thisSet
            }            
        });
    }
    return bestFit;
}

//vectors have two points, each point has an x and y
function vectorMetric(v1, v2){
    return Math.abs(v1.direction-v2.direction) + Math.abs(v1.magnitude-v2.magnitude)
}

function interpretData(data){
    const line=""//extract the line of best fit from the data
    const otherData=""//extract the rest of the data
    return {"line":line, "data":otherData}
}