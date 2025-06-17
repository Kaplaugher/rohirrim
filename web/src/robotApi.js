import axios from 'axios';

const API_URL = 'http://localhost:3000/robot';

export async function getRobotPosition() {
  const res = await axios.get(`${API_URL}/position`);
  return res.data;
}

export async function sendRobotCommand(command) {
  const res = await axios.post(`${API_URL}/command`, command);
  return res.data;
}
