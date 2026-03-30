// frontend/src/controllers/user/menu.js
import axios from '../../utils/axiosInstance';

export const getMenuByCafeteria = async (cafeteriaName) => {
  try {
    const response = await axios.get(`/menu/user/${cafeteriaName}`);
    if (response.data.success) {
      return response.data.menu;
    }
    return [];
  } catch (err) {
    console.error('Menu fetch error:', err);
    return [];
  }
};

