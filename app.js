const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("public"))
const PORT =3000 
//AQUI ESTA PARA COMPOSE JA
mongoose.connect ("mongodb://mongo:27017/cruddb")//("mongodb://mongo:27017/cruddb") para rodar o compose e ("mongodb://localhost:27017/cruddb") para apenas dockerizar o mongo
.then(() => console.log("mongodb conectado"))
.catch(err => console.log(err));

const User = mongoose.model("User",{
    name:String,
    age: Number
}); 


app.post("/users", async(req,res)=> {
    const user = new User({
        name : req.body.name,
        age: req.body.age
    });

    await user.save();
    res.send(user);
}); 

app.get("/users", async(req,res) => {
    const users = await User.find();
    res.send(users);
});

app.put("/users/:id", async (req,res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new : true}
    );

    res.send(user);
});

app.delete("/users/:id", async (req,res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send("usuario removido");
});



app.listen(PORT, () => {
    console.log("servidor rodando na porta" + PORT);
});


