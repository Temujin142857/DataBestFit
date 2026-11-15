import React, {useRef} from "react";
import {createRoot} from 'react-dom/client';
import { ReactSketchCanvas } from "react-sketch-canvas";

function OneStroke() {
   const canvasRef = useRef(null);
   const hasStroke = useRef(false);

   function pointerDownHandler() {
      if (hasStroke.current) {
         canvasRef.current.resetCanvas();
         hasStroke.current = false;
      }
   }

   function handleStroke() {
      hasStroke.current = true;
   }

   return (
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
   );
}

createRoot(document.getElementById("canvas")).render(
   <OneStroke />
);