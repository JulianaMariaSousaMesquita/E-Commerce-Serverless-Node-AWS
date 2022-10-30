require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()

//config json
app.use(express.json())

//Models
const User = require('./models/User')

// Rota publica
app.get('/', (req, res) => {
    res.status(200).json({msg: "Bem vindo - API Usuario"})
})

//Registrar usuario
app.post('/auth/register', async(req, res) => {
    const { name, email, password, confirmpassword } = req.body
    
    //validações
    if(!name){
        return res.status(422).json({msg: 'O nome é obrigatório!'})
    }
    if(!email){
        return res.status(422).json({msg: 'O E-mail é obrigatório!'})
    }
    if(!password){
        return res.status(422).json({msg: 'A senha é obrigatória!'})
    }
    if(!confirmpassword){
        return res.status(422).json({msg: 'A confirmação de senha é obrigatória!'})
    }

    if(password !== confirmpassword){
        return res.status(422).json({msg: 'As senhas não conferem!'})
    }

    //Checar se e-mail já existe na base do banco de dados
    const userExists = await User.findOne({ email: email })
    if(userExists){
        return res.status(422).json({msg: 'E-mail já cadastrado, Utilize outro e-mail!'})
    }

    //Criar senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Criar usuario no banco de dados
    const user = new User({
        name,
        email,
        password: passwordHash
    })

    try{
        await user.save()
        res.status(201).json({msg: 'Usuário criado com sucesso!'})
    }catch(error){
        console.log(' Ocorreu um erro no servidor! - Erro : ' + error)
        res.status(500).json({msg: ' Ocorreu um erro no servidor! - Erro : ' + error + ' Tente novamente! '})
    }
})

//Credenciais
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.j8armv4.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    app.listen(3000)
    console.log('Conectou ao banco de dados Mongodb Atlas!')
}).catch((err) => console.log(err))