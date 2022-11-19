
const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const db = knex({
    client : 'pg',
    connection : {
        host : '127.0.0.1',
        user : 'smartbrain',
        password : 'password',
        database : 'smartbrain'
    }
})




const app = express();

app.use(express.json());
app.use(cors());


const database ={
    users : [
        {
            id : '123',
            name : 'jhon',
            email : 'jhon@gmail.com',
            password : 'password',
            entries : 0,
            joined : new Date(),
        },
        {
            id : '124',
            name : 'sally',
            email : 'sally@gmail.com',
            password : 'password',
            entries : 0,
            joined : new Date(),
        },
        {
            id : '125',
            name : 'walid elbir',
            email : 'walid.el.biir@gmail.com',
            password : 'walidelbir',
            entries : 0,
            joined : new Date()
        }
    ],
    sorted_users : []
}
const sort_by_entries =(a,b) =>{
    if (a.entries < b.entries) return 1;
    if (a.entries > b.entries) return -1;
    return 0;
}
const sort_users = () => {
    database.sorted_users = [...database.users]
    database.sorted_users.sort(sort_by_entries);
}
sort_users()

// app.post('/signin', (req , res) => {
//     const {email,password} = req.body;
//     db('login')
//     .select('hash')
//     .where('email' ,'=' , email)
//     .then(data =>{
//         if(data){
//         bcrypt.compare(password,data,(err,same)=>{
//             if(err) console.log(err)
//             else if(same){
//                 db('users')
//                 .denseRank('rank_no',function(){
//                     this.orderBy('entries' , 'desc')
//                     })
//                 .select('id_users')
//                 .then(response => 
                    
//                 )
//         }
//         }
//         )
//         }
//         }
//     )
// }
// )


app.post('/register', (req , res) => {
    const { name, email, password } = req.body;
        db('users')
        .returning('*')
        .insert({
            email : email,
            name : name,
            joined : new Date()
        }).then(response =>
            {
                if(response) 
                    {
                        
                        db('login')
                        .returning('*')
                        .insert({ 
                            email : response[0].email,
                            id_login : response[0].id_users
                        })
                        .then(x =>{
                            if(x)
                            {
                                bcrypt.hash(password,null,null,(err,result) =>{
                                    if(err) console.log('error hashing password')
                                    else {
                                        db('login')
                                        .returning('hash')
                                        .update({hash : result})
                                        .where('id_login','=',response[0].id_users)
                                        .then(y =>{
                                            if(y)                                 
                                            res.status(200).json(response[0])
                                        })
                                        .catch('error inserting hash')
                                    };
                                })
                                console.log(x)}
                        })
                        .catch(err => console.log(err))
                        
                        
                    }
            }
            )
        .catch( err => {
            if(err.code === '23505')
            res.status(400).json(`This email '${email}' is already registered`);
        }
        )


    }
)


app.get('/profile/:id', (req , res) => {
    const {id} = req.params;
    db('users')
    .where('id_users' , id)
    .select()
    .then(response => {
        if(response.length)
        res.json(response[0])
        else 
        res.status(400).json('user not found !')
        
    })
    .catch(console.log)
    }
)

const incrementEntries = (id) =>{
    db('users')
    .where('id_users' , '=' , id)
    .increment({
        entries : 1
    })
    .catch(err => console.log(err))
}



app.put('/image',(req , res) => {
    let id = Number(req.body.id);
    incrementEntries(id);
    db('users')
    .denseRank('rank_no',function(){
        this.orderBy('entries' , 'desc')
    })
    .select('id_users')
    .then(response => 
        res.json(
            response.find(element => element.id_users === id)
        )
    )
    .catch( console.log)
    
    }
)

app.get('/', (req, res) => {
    res.send(database.users);
})

app.listen(3000 , () => {
    console.log('Listening on port 3000 ...');
    db.select('*').from('users').then(data => console.log(data));
})

