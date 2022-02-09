const express = require('express')

const app =express()
const PORT = process.env.PORT || 5000

app.get('/', (req, res) =>  {
    res.send('Happy New Year')
})


app.listen(PORT, () => {
    console.log(`Connected to the PORT ${PORT}`);
})