const express = require('express');
const bcrypt = require('bcryptjs');
require('./db/mongoose.js'); //connects to database
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const port = process.env.PORT;

const app = express();

app.use(express.json()); //auto parse as an object any json which express recieves.
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
	console.log('server is running on port ' + port);
});
