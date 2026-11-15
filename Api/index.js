import { readdir } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import csv from 'csv-parser';
import cors from 'cors';



const app = express();
const port = 5002;

app.use(cors({
  origin: 'https://realify.tomionagano.ca',
}));

const FILEPATH=path.join("C:","Users","Temuj","Programming","DataBestFit","Data","postprocessing.csv")
const DIRECTORY=path.join("C:","Users","Temuj","Programming","DataBestFit","Data","all_that_bs")


app.use(express.json());

app.post('/chartOfBestFit', async (req, res) => {
    console.log("heard", req.body)
    const line=cleanLine(req.body)
    console.log(line)
    const bestFit=await loadLines(line)    
    fs.readFile(path.join(DIRECTORY, bestFit["dataFileName"]), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("bestfit", bestFit)
        console.log("returning", {x: bestFit["columns"]["x"], y: bestFit["columns"]["y"], data:data})
        res.send({x:bestFit["columns"]["x"], y: bestFit["columns"]["y"], data:data});
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

/**
const line=cleanLine({p1:{x: 5, y: 6}, p2: {x: 8, y: 10}})
console.log(line)
const bestFit=await loadLines(line)  
console.log(bestFit)
fs.readFile(path.join(DIRECTORY, bestFit["dataFileName"]), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
});
*/

function cleanLine(line){
    let vector={}
    vector["slope"]=(line["p2"]["y"]-line["p1"]["y"])/(line["p2"]["x"]-line["p1"]["x"])
    vector["magnitude"]=Math.sqrt(((line["p2"]["y"]-line["p1"]["y"])**2)+((line["p2"]["x"]-line["p1"]["x"])**2))
    return vector
}

async function loadLines(line){
    return new Promise((resolve, reject) => {
        let bestFit={"fitValue": Number.MAX_VALUE, "dataFileName": ""}
        console.log("hi2")
        fs.createReadStream(FILEPATH)
            .pipe(csv())
            .on('data', (data)=>{bestFit=processRow(data, line, bestFit)})
            .on('end', () => {
                console.log("hi3", bestFit);
                resolve(bestFit);
            });
    });
}

function processRow(data, line, bestFit){
    console.log("hi", data);
    const thisSet=interpretData(data)
    thisSet["fitValue"]=vectorMetric(thisSet, line)
    console.log(thisSet["fitValue"])
    if(thisSet["fitValue"]<bestFit["fitValue"]){
        console.log("hi4", thisSet)
        return thisSet
    }
    return bestFit
}

//vectors have two points, each point has an x and y
function vectorMetric(v1, v2){
    console.log(v1["slope"], v2["slope"])
    return Math.abs(v1["slope"]-v2["slope"])
}

function interpretData(data){
    const slope=data[" line (m)"];//extract the line of best fit from the data
    console.log(slope)
    const dataFileName=data["filename"];//extract the rest of the data
    console.log(dataFileName)
    const columns={x:data[" x"], y:data[" y"]}
    console.log("columns", columns)
    return {"slope":slope, "dataFileName": dataFileName, "columns": columns};
}