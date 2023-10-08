import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import ReactDataGrid from 'react-data-grid';
import './excel-grid.css';
import 'react-data-grid/lib/styles.css';

function ExcelUploader() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (excelData.length) {
          // Extract column names from the first row
          const headers = excelData[0];

          // Prepare data for react-data-grid
          const rows = excelData.slice(1).map((row, index) => {
            const obj = {};
            headers.forEach((header, columnIndex) => {
              obj[header] = row[columnIndex];
            });
            obj.id = index; // Add an 'id' property for react-data-grid
            return obj;
          });

          // Prepare columns for react-data-grid
          const columns = headers.map((header) => ({
            key: header,
            name: header,
          }));

          setData(rows);
          setColumns(columns);
          setError(null); // Clear any previous error
        } else {
          setError('The Excel file is empty.');
        }
      } catch (err) {
        setError('An error occurred while reading the Excel file. Please check the file format.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} className={`dotted-box dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <p>Drag & drop an Excel file here, or click to select one</p>
      </div>
      {error && <p className="error">{error}</p>}
      {data.length > 0 && (
        <div className="data-grid-container">
          <ReactDataGrid
            columns={columns}
            rows={data}
          />
        </div>
      )}
    </div>
  );
}

export default ExcelUploader;

