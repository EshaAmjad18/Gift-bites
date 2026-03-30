//Components //staff// AddMenuItemForm.jsx
import React, { useState } from 'react';

function AddMenuItemForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    isHotItem: false,
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit}
      style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>

      <h3 style={{ marginBottom: '15px', color: '#023047' }}>Add New Item</h3>

      <input name="name" placeholder="Item name" required onChange={handleChange} />
      <input name="category" placeholder="Category" required onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" required onChange={handleChange} />

      <div style={{ marginTop: '10px' }}>
        <input type="checkbox" name="isHotItem" onChange={handleChange} /> Hot Item
      </div>

      <input type="file" name="image" accept="image/*" onChange={handleChange} />

      <button style={{
        marginTop: '15px',
        background: '#fb8500',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '6px'
      }}>
        Add Item
      </button>
    </form>
  );
}

export default AddMenuItemForm;

/**
 * File Description:
 * -----------------
 * Staff menu item add form.
 * Supports image upload & hot item flag.
 */
