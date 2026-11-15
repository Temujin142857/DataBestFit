import React, {useRef} from "react";
import {createRoot} from 'react-dom/client';
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
   }

   return (
      <div className="canvas-container">
      <div onPointerDownCapture={pointerDownHandler}>
         <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="300px"
            strokeWidth={1}
            strokeColor="black"
            onStroke={handleStroke}
         />   
      </div>
      <p>Draw your dream graph!</p>
      <button type="button" onClick={saveStroke}>
         Realify!
      </button>
      </div>
   );
}

createRoot(document.getElementById("canvas")).render(
   <OneStroke />
);