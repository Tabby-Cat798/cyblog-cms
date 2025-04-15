import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function revalidateFrontend({ path, postId }) {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}/api/revalidate`,
      { path, postId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REVALIDATE_TOKEN}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('重新验证前端失败:', error.response?.data || error.message);
    throw error;
  }
} 