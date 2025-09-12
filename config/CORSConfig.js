const cors = require("cors");

app.use(cors({
  origin: "http://localhost:4200",
  credentials: true // allows cookies
}));
