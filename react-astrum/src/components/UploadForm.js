import React, { useState } from 'react';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Выберите файл!');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setImageUrl(`http://localhost:5000${data.imageUrl}`);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Загрузить</button>
      {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ width: 200 }} />}
    </div>
  );
}

export default UploadForm;
