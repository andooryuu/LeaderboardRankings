import { useState } from "react";

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm = ({ onUploadSuccess }: UploadFormProps) => {
  const [file] = useState<File | null>(null);

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
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
