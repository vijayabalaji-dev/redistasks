const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyparser = require('body-parser')
const redis = require('redis')
const client = redis.createClient()
const app = express()
var tasks
client.connect()
client.on('connect', () => {
    console.log("Connected to redis")
})

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(logger('dev'))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname,'public')))

app.get('/',async (req,res) => {
       
    tasks = await client.lRange('tasks',0,-1)
    
    userCall = await client.hGetAll('userCall')

    res.render('index',{
        title : "My All Tasks",
        tasks : tasks,
        user : userCall
    })   
})

app.post('/task/add', async (req,res) => {

    let task = req.body.task

    await client.rPush('tasks', task)
    
    res.redirect('/')
})

app.post('/task/delete' , async (req,res) => {
    let itemstodelete = req.body.tasks
      for(let i = 0;i < itemstodelete.length;i++)
      {
          if(itemstodelete.indexOf(tasks[i]) != -1)
          {
            await client.lRem('tasks',1,tasks[i])
          }
      }
      res.redirect('/')
})

app.post('/task/nextcall', async (req, res) => {
    let name = req.body.name
    let comapny = req.body.company
    let phone = req.body.phone
    let datetime = req.body.datetime

    await client.hSet('userCall','name',name)
    await client.hSet('userCall','company',comapny)
    await client.hSet('userCall','phone',phone)
    await client.hSet('userCall','datetime',datetime)
    
    res.redirect('/')
})
app.listen(3000)
console.log("App Started")

module.exports = app

