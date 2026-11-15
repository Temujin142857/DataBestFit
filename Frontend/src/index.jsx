import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ReactSketchCanvas } from "react-sketch-canvas";
import Papa from "papaparse";

function parseCsv(csvString) {
  const result = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const data = result.data;

  //Common ID/index column names
  const excludedColumns = ["", "id", "index", "unnamed: 0"];

  const columns = result.meta.fields.filter((column) => {
    const normalized = column.trim().toLowerCase();

    //Exclude ID/index columns
    if (excludedColumns.includes(normalized)) {
      return false;
    }

    //Only include numeric columns
    return data.some(
      (row) => typeof row[column] === "number" && Number.isFinite(row[column]),
    );
  });

  return {
    data,
    columns,
  };
}

// Convert parsed CSV into numerical (x, y) pairs.
function csvToPoints(csv) {
  const { data, columns } = parseCsv(csv);

  if (columns.length === 0) {
    throw new Error("No numeric columns in the CSV");
  }

  // With one numeric column, use the row index as x.
  // With two or more, use the first two numeric columns.
  const xColumn = columns.length > 1 ? columns[0] : null;
  const yColumn = columns.length > 1 ? columns[1] : columns[0];

  const points = data.map((row, index) => ({
    x: xColumn ? row[xColumn] : index,
    y: row[yColumn]
  })).filter(p =>
    Number.isFinite(p.x) && Number.isFinite(p.y)
  );

  if (points.length < 2) {
    throw new Error("Not enough valid data points");
  }

  return points;
}

// Map data onto the drawn line using linear scaling.
// The dataset's regression line is aligned with the
// user's chosen endpoints, without altering data values.
function alignData(data, stroke, height) {
  const endpoints = [stroke[0], stroke[stroke.length - 1]]
    .sort((a, b) => a.x - b.x);

  const [left, right] = endpoints;
  const dx = right.x - left.x;

  if (dx < 1) {
    throw new Error("Please draw a non-vertical line");
  }

  const xs = data.map(p => p.x);
  const ys = data.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const xRange = maxX - minX;
  if (xRange === 0) {
    throw new Error("The data has no X variation");
  }

  // Calculate the least-squares regression slope.
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;

  let covariance = 0;
  let variance = 0;

  for (const p of data) {
    covariance += (p.x - meanX) * (p.y - meanY);
    variance += (p.x - meanX) ** 2;
  }

  const slope = covariance / variance;
  const fittedChange = slope * xRange;
  const drawnChange = right.y - left.y;

  let yScale;

  if (Math.abs(drawnChange) < 1) {
    // Special case: an almost-horizontal drawn line.
    // Give the points a visible vertical spread.
    yScale = -(height * 0.3) / Math.max(maxY - minY, 1e-9);
  } else {
    if (
      Math.abs(fittedChange) < 1e-9 ||
      drawnChange / fittedChange >= 0
    ) {
      throw new Error(
        "The dataset's trend does not match the drawn line"
      );
    }

    yScale = drawnChange / fittedChange;
  }

  const fittedAtLeft = meanY + slope * (minX - meanX);

  return data.map(p => ({
    x: left.x + ((p.x - minX) / xRange) * dx,
    y: left.y + (p.y - fittedAtLeft) * yScale
  }));
}

function OneStroke() {
  const canvasRef = useRef(null);
  const surfaceRef = useRef(null);
  const latestPath = useRef(null);

  const [phase, setPhase] = useState("drawing");
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [graphPoints, setGraphPoints] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 600,
    height: 300
  });
  const [error, setError] = useState("");

  function pointerDownHandler() {
    if (latestPath.current) {
      canvasRef.current.resetCanvas();
      latestPath.current = null;
    }
  }

  function handleStroke(path, isEraser) {
    if (!isEraser) {
      latestPath.current = path;
      console.log("Points:", path.paths);
    }
  }

  async function saveStroke() {
    if (!latestPath.current?.paths?.length) return;

    const points = latestPath.current.paths.map(p => ({
      x: p.x,
      y: p.y
    }));

    const bounds = surfaceRef.current.getBoundingClientRect();

    setDrawnPoints(points);
    setCanvasSize({
      width: bounds.width,
      height: bounds.height
    });
    setError("");
    setPhase("loading");

    try {
      const response = await fetch(
        "https://chartify.temujin142857.ca/chartOfBestFit",
        {
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            p1: points[0],
            p2: points[points.length - 1]
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Network response was not ok: " + response.statusText
        );
      }

      // Your backend returns CSV text, not JSON.
      const csv = await response.text();
      console.log("Received CSV:", csv);

      // Parse and transform the numerical data.
      const dataPoints = csvToPoints(csv);
      const projectedPoints = alignData(
        dataPoints,
        points,
        bounds.height
      );

      setGraphPoints(projectedPoints);
      setPhase("result");

    } catch (err) {
      console.error(err);
      setError(err.message);
      setPhase("error");
    }
  }

  function startOver() {
    latestPath.current = null;
    setDrawnPoints([]);
    setGraphPoints([]);
    setError("");
    setPhase("drawing");
  }

  function toPolyline(points) {
    return points.map(p => `${p.x},${p.y}`).join(" ");
  }

  return (
    <div className="canvas-container">

      {phase === "drawing" && (
        <>
          <div
            ref={surfaceRef}
            className="drawing-surface"
            onPointerDownCapture={pointerDownHandler}
          >
            <ReactSketchCanvas
              ref={canvasRef}
              width="100%"
              height="300px"
              strokeWidth={1}
              strokeColor="black"
              onStroke={handleStroke}
            />
          </div>

          <p id="sub">Draw your dream graph!</p>

          <button type="button" onClick={saveStroke}>
            Realify!
          </button>
        </>
      )}

      {phase === "loading" && (
        <section className="loading-section" role="status">
          <div className="spinner"></div>
          <p>Finding your perfect graph...</p>
        </section>
      )}

      {phase === "result" && (
        <>
          <h2>Your Realified Graph!</h2>

          <svg
            className="result-graph"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          >
            {/* The user's original drawn line */}
            <polyline
              points={toPolyline(drawnPoints)}
              fill="none"
              stroke="black"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Translucent data points over the drawn line */}
            <g opacity="0.4">
              {graphPoints.map((p, index) => (
                <circle
                  key={index}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#0066aa"
                />
              ))}
            </g>
          </svg>

          <button type="button" onClick={startOver}>
            Try Again
          </button>
        </>
      )}

      {phase === "error" && (
        <>
          <p>Something went wrong: {error}</p>
          <button type="button" onClick={startOver}>
            Try Again
          </button>
        </>
      )}

    </div>
  );
}

createRoot(document.getElementById("canvas")).render(
  <OneStroke />
);