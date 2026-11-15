//gpt generated these, so if we have time and want to rewrite them we can

import Papa from "papaparse";

//should arrive back in body somewhere I think
export function parseCsv(csvString) {
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

import { useState } from "react";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function dynamicScatterPlot({ data, columns }) {
  const [xAxis, setXAxis] = useState(columns[0] ?? "");
  const [yAxis, setYAxis] = useState(columns[1] ?? columns[0] ?? "");

  if (!data?.length || !columns?.length) {
    return <p>No numeric data available.</p>;
  }

  return (
    <div>
      {/* Axis selectors */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <label>
          X Axis:
          <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label>
          Y Axis:
          <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Scatterplot */}
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ bottom: 25, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            dataKey={xAxis}
            name={xAxis}
            label={{
              value: xAxis,
              position: "insideBottom",
              offset: -15,
            }}
          />

          <YAxis
            type="number"
            dataKey={yAxis}
            name={yAxis}
            label={{
              value: yAxis,
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip cursor={{ strokeDasharray: "3 3" }} />

          <Scatter name="Data" data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
