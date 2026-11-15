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