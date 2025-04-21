import { useState } from "react";
import Papa from "papaparse";

function UploadForm() {
  const [csvData, setCsvData] = useState([]);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const rawData = results.data;

        // ✅ Do your tweaks here!
        const tweaked = rawData.map((row: any) => {
          return {
            ...row,
            newField: row.existingField?.toUpperCase(), // just an example
          };
        });

        setCsvData(tweaked);
      },
    });
  };

  return (
    <div>
      <label htmlFor="csvFileInput">Upload CSV File:</label>
      <input
        id="csvFileInput"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        title="Choose a CSV file to upload"
      />
      <h3>Preview</h3>
      <table border={1}>
        <thead>
          <tr>
            {csvData[0] &&
              Object.keys(csvData[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((val, i) => (
                <td key={i}>{String(val)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UploadForm;
