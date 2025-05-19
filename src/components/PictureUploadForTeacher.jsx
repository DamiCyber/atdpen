import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const PictureUploadForTeacher = ({ onUploadSuccess }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('profile_picture', image);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'https://attendipen-d65abecaffe3.herokuapp.com/profile/edit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Upload response:', response.data);

      // Update local storage with new profile picture
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({
        ...userData,
        profile_picture: response.data.profile_picture,
        updatedAt: new Date().toISOString()
      }));

      // Show success message
      Swal.fire({
        title: "Success!",
        text: "Profile picture updated successfully",
        icon: "success",
        confirmButtonColor: "#4D44B5"
      });

      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Navigate to profile page
      navigate('/MyProfile');

    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to upload profile picture",
        icon: "error",
        confirmButtonColor: "#4D44B5"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#4D44B5] file:text-white
              hover:file:bg-[#3a3366]"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={uploading || !image}
          className={`w-full px-4 py-2 rounded-lg text-white ${
            uploading || !image
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#4D44B5] hover:bg-[#3a3366]'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Picture'}
        </button>
      </form>

      {preview && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-700">Preview:</h2>
          <div className="mt-2 p-2 border rounded-lg">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-md shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PictureUploadForTeacher;
