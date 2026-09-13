import { createApp } from "./app.js";

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor Backend 360 iniciado en puerto ${PORT}`);
  console.log(`📡 URL API: http://localhost:${PORT}/api/dashboard`);
  console.log(`=======================================================`);
});
