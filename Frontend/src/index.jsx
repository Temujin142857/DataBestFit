import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import { ReactSketchCanvas } from "react-sketch-canvas";

function OneStroke() {
  const canvasRef = useRef(null);
  const latestPath = useRef(false);

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
    if (!latestPath.current) return;

    const points = latestPath.current.paths;
    console.log("Saved points:", points);

    try {
      console.log(
        JSON.stringify({
          p1: { x: points[0]["x"], y: points[0]["y"] },
          p2: {
            x: points[points.length - 1]["x"],
            y: points[points.length - 1]["y"],
          },
        }),
      );
      const response = await fetch(
        "https://chartify.temujin142857.ca/chartOfBestFit",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            p1: { x: points[0]["x"], y: points[0]["y"] },
            p2: {
              x: points[points.length - 1]["x"],
              y: points[points.length - 1]["y"],
            },
          }),
        },
      );
      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      console.log("raw responce: ", response);
      // Parse the response as JSON
      const data = await response.json();
      console.log("raw responce json: ", data);
      return data;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  return (
    <>
      <div onPointerDownCapture={pointerDownHandler}>
        <ReactSketchCanvas
          ref={canvasRef}
          width="150px"
          height="150px"
          strokeWidth={1}
          strokeColor="black"
          onStroke={handleStroke}
        />
      </div>

      <button type="button" onClick={saveStroke}>
        Realify!
      </button>
    </>
  );
}

createRoot(document.getElementById("canvas")).render(<OneStroke />);
