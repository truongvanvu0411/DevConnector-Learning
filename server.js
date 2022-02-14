const express = require('express')
const connectDB = require('./config/db')

const app =express()
const PORT = process.env.PORT || 5000

//Connect DB
connectDB();

//Init Midleware
app.use(express.json({ extended: false}))

//Test get API. API route implement on Route file
app.get('/', (req, res) =>  {
    res.send('Happy New Year')
})

// Define api routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));


app.listen(PORT, () => {
    console.log(`Connected to the PORT ${PORT}`);
})