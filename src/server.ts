import app from "./app";

const port = Number(process.env.PORT) || 3000;
const nodeEnv = process.env.NODE_ENV || "development";

app.listen(port, () => {
  console.log(`CampusHub API is running on port ${port}`);
  console.log(`Environment: ${nodeEnv}`);
});