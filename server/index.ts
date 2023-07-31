import express, {Express, Request, Response} from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { userRoutes } from './routes/user'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

// JSON, CORS, and URL encoding middleware
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))

app.use("/users", userRoutes)
app.get('/', (req, res) => {
    res.send('If You are seeing this, the server is working properly!')
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
