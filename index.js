//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "welcome to your todolist!"
});
const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  async function run() {
    try{
    const founditems = await Item.find();
    if (founditems.length === 0){
      await Item.insertMany(defaultItems);
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    } 
  }
    finally{
    // console.log();
    }
 }
  run().catch(console.dir);
});

app.get("/:customListName", function(req, res){
  const customListName = (req.params.customListName);
  async function run() {
    try{
    const foundList = await List.findOne({name: customListName}).exec();
    if (!foundList){
    const list = new List({
    name: customListName,
    items: defaultItems
     });
     list.save();
     res.redirect("/" + customListName)
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    } 
    finally{
    // console.log();
    }
 }
  run().catch(console.dir);
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    async function run() {
      try{
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
      } 
      finally{
      // console.log();
      }
   }
    run().catch(console.dir);    
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;
  async function run() {
    try{
    if(listName === "Today"){
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
      }
      else{
        await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        res.redirect("/"+ listName);
      }
    } 
    finally{
    // console.log();
    }
 }
  run().catch(console.dir);
});

app.get("/about", function(req, res){
  res.render("about");
});

// connectDB().then(() => {
//     app.listen(PORT, () => {
//     })
// })
app.listen(PORT, function() {
    console.log("Server started on port 3000");
  });