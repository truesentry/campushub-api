import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`CampusHub API is running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
