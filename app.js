const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');


main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb://localhost:27017/todolistDB');
  }
 
const itemsSchema = new mongoose.Schema ({
    name: String
})
const Item = new mongoose.model("item", itemsSchema);

// default item
const item1 = new Item ({
    name: "Buy Food"
});

const item2 = new Item ({
    name: "Eat Food"
});

// default array
const defaultItems = [item1, item2];

const listSchema = new mongoose.Schema ({
    name: String, 
    items: [itemsSchema]
})

const List = new mongoose.model("list", listSchema);




app.get("/", function (req, res) {

    Item.find({},function(err, items) {
        if (err) {
            console.log(err);
        } else {
            // getting the date
            if (items.length == 0) {
                Item.insertMany(defaultItems, function(err){
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('added');
                    }
                });
                res.redirect("/");
            } else {
                res.render('list', {
                    listTitle: "Today",
                    newItems: items
                });
            }

            
        }
    })

    
})



app.post("/", function (req, res) {
    const listName = req.body.list.trim();
    const itemName = req.body.newItem.trim();
    
    const newItem = new Item ({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, list) {
            list.items.push(newItem);
            list.save();
            res.redirect("/" + listName);
        })
    }
})

app.post("/delete", function(req,res) {
    const checkedItemID = req.body.checkbox.trim();
    const listName = req.body.list.trim();
    
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemID, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("deleted");
                res.redirect("/");
            }
        }) 
        
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err) {
            if (!err) {
                res.redirect("/" + listName);
            } else {
                console.log(err);
            }
        })
  
    }
})

app.get("/:listName", function (req, res) {

    const listName = _.capitalize(req.params.listName);
    List.findOne({name: listName}, function(err, list) {
        if (err) {
            console.log(err);
        } else {
            if (list) {
                // show existing list
                res.render('list', {
                    listTitle: list.name,
                    newItems: list.items
                })
            } else {
                // create new list
                const newList = new List ({
                    name: listName,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + listName);
            }
        } 
        
    })

    



})

app.get("/about", function (req, res) {
    res.render("about");
})

app.listen(3000, function () {
    console.log("listening on port 3000...");
})