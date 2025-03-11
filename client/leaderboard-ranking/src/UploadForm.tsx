import { useState } from "react";

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm = ({ onUploadSuccess }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("csv", file);

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    alert(JSON.stringify(result, null, 2));
    onUploadSuccess();
    console.log("here");
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
