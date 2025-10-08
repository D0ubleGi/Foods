
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { type } = require('os');
const { buffer } = require('stream/consumers');
const axios = require("axios");
const AWS = require('aws-sdk');
const { stringify } = require('querystring');
require('dotenv').config({ path: './.env' });


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function deleteFromS3(fileName) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName
  };

  try {
    const data = await s3.deleteObject(params).promise();
    console.log(`✅ S3 delete called for: ${fileName}`);
  } catch (err) {
    console.error('❌ Error deleting file:', err);
  }
}



async function uploadToS3(fileName, fileBuffer, mimeType) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType
  };

   try {
    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully. URL:', data.Location);
    return data.Location;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
}

module.exports = { uploadToS3 };


const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const server = http.createServer(app, {
  maxHeaderSize: 1024 * 1024 * 50
});


const MONGO_URI = process.env.MONGO_URI || 'your-backup-uri-here';
const PORT = process.env.PORT || 3000;

console.log("📦 MONGO_URI is:", MONGO_URI);

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  user: { type: String, required: true, unique:true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  active: {type:Date, required:false}
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const IdSchema = new mongoose.Schema({
  id: { type: String, required: true, unique:true },
  name: { type: String, required: true },
  maxmum: { type: String, required: true }
}, { timestamps: true });
const Ids = mongoose.model('Ids', IdSchema);

const TaskSchema = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true }
}, { timestamps: true });
const Tasks = mongoose.model('Tasks', TaskSchema);

const RecipesSchema = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true }
}, { timestamps: true });
const Recipes = mongoose.model('Recipes', RecipesSchema);

const TasksSchemaa = new mongoose.Schema({
  id: {type: String, required:true},
  idd: {type: String, required: true},
  taskname: {type: String, required:true},
  tasktitle: {type: String, required:true},
  taskdescription: {type: String, required:true}},
  {timestamps: true});
  const Taskebi = mongoose.model('Taskebi', TasksSchemaa);

  const Codee = new mongoose.Schema({
    user: {type:String, required:true},
    code: {type:String, required:true}
  },
  {timestamps: true});
  const Code = mongoose.model('Codee',Codee);

  const RecipeSchema = new mongoose.Schema({
    id: {type: String, required: true},
    idd: {type: String, required: true,unique:true},
    img: {type: String, required: true},
    imgtype: {type: String, required:true},
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
    time: {type: Number, required: true},
    hour: {type:String, required: true},
    rate: {type: Number, required: true},
    level: {type: String, required: true},
    amount: {type: Number, required:true},
    user: {type: String, required: true},
    timi: {type:String, required:true}
  },
    {timestamps: true});
    const Recipt = mongoose.model('Recipt',RecipeSchema);

    const deskShema = new mongoose.Schema({
      id: {type: String, required: true, unique:true},
      html: {type:String, required: true}
    },
    {timestamps:true});
    const Desk = mongoose.model('Desk',deskShema);

    const favSchema = new mongoose.Schema({
      idi: {type:String, required:true},
      id: {type:String, required:true, unique:true},
      user: {type:String, required:true}},
    {timestamps: true});
    const Favs = mongoose.model('Favs',favSchema);

    const Ratee = new mongoose.Schema({
      id: {type:String, required:true},
      user: {type:String, required:true}},
      {timestamps:true});
      const Rate = mongoose.model('Rate',Ratee);

      const Commentss = new mongoose.Schema({
        id: {type:String, required:true},
        user: {type:String, required:true},
        comment: {type:String, required:true},
        date: {type:String, required:true},
        idd: {type:String, required:true}
      },
      {timestamps:true});
      const Comments = mongoose.model('Comments',Commentss);

      const Detailss = new mongoose.Schema({
        id: {type:String, required:true},
        idd:{type:String, required:true},
        user:{type:String, required:true},
        details: { type: [String] }
      },
      {timestamps:true});
      const Details = mongoose.model('Details',Detailss);

      const Friendss = new mongoose.Schema({
        id: {type:String, required:true},
        user: {type:String, required:true},
        friend: {type:String, required:true},
        active: {type:Date, required:false}
      },
    {timestamps:true});
    const Friends = mongoose.model('Friends',Friendss);

    const requestss = new mongoose.Schema({
      send: {type:String, required:true},
      rec: {type:String,required:true}
    },
  {timestamps:true});
  const Requests = mongoose.model('Requests',requestss);

  const messagee = new mongoose.Schema({
    id: {type:String, required:true},
    sender: {type:String, required:true},
    receiver: {type:String, required:true},
    message: {type:String, required:true},
    date: {type:String, required:true}
  },
{timestamps:true});
const Message = mongoose.model('Message',messagee);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 200000,
  pingInterval: 30000,
  maxHttpBufferSize: 1e8  
});

let soketi = null;
io.on('connection', async (socket) => {
  console.log('🟢 New user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });

  soketi=socket.id;

  socket.on('register', async (username, email, password) => {
    console.log('📩 Registering user:', username);
    try {
      const useremailExists = await User.findOne({ user: username, email: email });
      if (useremailExists) {
        console.log('❌ Email and username already exists');
        socket.emit('register-taken', 'eutaken');
        return;
      }

      const userExists = await User.findOne({ user: username });
      if (userExists) {
        console.log('❌ User already exists');
        socket.emit('register-taken', 'utaken');
        return;
      }

      const emailExists = await User.findOne({ email: email });
      if (emailExists) {
        console.log('❌ Email already exists');
        socket.emit('register-taken', 'etaken');
        return;
      }

      const newUser = new User({ user: username, email, password });
      await newUser.save();
      console.log('✅ User saved to DB');
      socket.emit('register-taken', 'added');
    } catch (err) {
      console.error('❌ Error saving user:', err.message);
      socket.emit('register-error', 'Error registering user');
    }
  });


   socket.on('signin', async (user, pass) => {
    const checkuser = await User.findOne({ user: user });
    const checkpassword = await User.findOne({ password: pass });
    const checkuserpass = await User.findOne({ user: user, password: pass });
    if (!checkuser) {
      console.log(`❌ User ${user} not found!`);
      socket.emit('wronguser', 'nousername');
      return;
    }
    if (!checkpassword) {
      console.log(`❌ Wrong password!`);
      socket.emit('wronguser', 'nopassword');
      return;
    }
    if (checkuserpass) {
      console.log(`✅ ${user} logged in!`);
      socket.emit('wronguser', 'logged', user);
      await User.updateOne(
        {user:user},
        {$set:{active:new Date()}}
      );
    }
  });

    socket.on('Add', async (userr, id) => {
    const checkmax = await Ids.findOne({ id: id });
    const numuses = await Recipes.find({id:id });
    const ioo= await Recipes.findOne({user:userr,id:id});
    const haa=numuses;
    if(!checkmax){
      socket.emit('respi', 'errii');
      console.log("❌ Wrong id!");
      return;
    }
    if(ioo){
      socket.emit('respi','aro');
      console.log("❌ Already registered!");
      return;
    }
    if (haa.length < Number(checkmax.maxmum)) {
      
      const newuser = new Recipes({ user: userr, name: checkmax.name, id: id });
      await newuser.save();
      console.log('✅ Successfully added!');
      socket.emit('respi', 'addded');
    } else {
      console.log('❌ Max amount of users reached for this Id!');
      socket.emit('respi', 'erri');
    }
  });

socket.on('dakode',async (name,email,code)=>{
  await Code.deleteMany({user:name});
const codi = new Code({
  user:name,
  code:code
});
await codi.save();
console.log( `code for ${name} is - ${code}`);
socket.emit('daaemaili',email,name,code);
});


socket.on('dacheke',async (name,code,username,email,password)=>{
  const cod= await Code.findOne({user:name});
  if(code==cod.code){
    try{
       const newUser = new User({ user: username, email:email, password:password });
      await newUser.save();
      console.log('✅ User saved to DB');
      socket.emit('onchecki', 'added');
    } catch (err) {
      console.error('❌ Error saving user:', err.message);
      socket.emit('register-error', 'Error registering user');
    }
    await Code.deleteMany({user:name});
  }
  else{
    socket.emit('onchecki',"wrong");
  }
});

socket.on('reset',async(name,email,code)=>{
await Code.deleteMany({user:name});
const codi = new Code({
  user:name,
  code:code
});
await codi.save();
console.log( `New code for ${name} is - ${code}`);
socket.emit('daaemail',email,name,code);
});

socket.on('cheemail',async(email)=>{
const chek = await User.findOne({email:email});
if(!chek){
  socket.emit('checkedemail','wrong');
  return;
}
else{
  socket.emit('sendee',email,chek.user,chek.password);
  socket.emit('checkedemail','done');
}
});

socket.on('check', async (id, nami, maxmumi,useri) => {
    console.log('🔍 Checking ID:', id, maxmumi);
    const checkid = await Ids.findOne({ id: id });
    const checknam= await Ids.findOne({name:nami});
    if (checkid) {
      console.log('❌ This ID already exists!');
      socket.emit('resp', "exists");
    } 
   
    else {
      const newId = new Ids({ id: id, name: nami, maxmum: maxmumi });
      await newId.save();
      const newts = new Recipes({user:useri,name:nami, id:id});
      await newts.save();
      console.log('✅ New ID added!');
      socket.emit('resp', 'addd');
    }
  });

  socket.on('load', async (userr) => {
    const taskss = await Recipes.find({ user: userr });
    socket.emit('loaded', taskss);
  });


  socket.on('recipt', async(id)=>{
    socket.join(id);
    const Receptebi = await Recipt.find({id:id});
    console.log(Receptebi.length);
    io.to(id).emit('reciptebi',Receptebi);
  });

socket.on('sear', async (term, id) => {
  try {
    const result = await Recipt.find({
      id: id,
      title: { $regex: '^' + term, $options: 'i' }
    });
    socket.emit('reciptebi', result);
  } catch (err) {
    console.error(err);
  }
});
socket.on('searr', async (term,user, id) => {
  try {
    const result = await Recipt.find({
      id: id,
      title: { $regex: '^' + term, $options: 'i' }
    });
     let obji=[];
for (const element of result) {
  const a = await Favs.findOne({id:element.idd,user:user});
  if(a){
obji.push({
  id:element.id,
  idd:element.idd,
  title:element.title,
  time:element.time,
  hour:element.hour,
  rate:element.rate,
  level:element.level,
  user:element.user
});
  }
}
console.log(obji.length);
socket.emit('aigefavs',obji);
obji=[];
  } 
  catch (err) {
    console.error(err);
  }
});

socket.on('filter',async (value,id,type)=>{console.log(value);
if(value==='time'){
  if(type==='Descending'){
const rawRecipes = await Recipt.aggregate([
  { $match: { id: id } },
  {
    $addFields: {
      timeInSeconds: {
        $switch: {
          branches: [
            { case: { $eq: ["$hour", "Hour"] }, then: { $multiply: ["$time", 3600] } },
            { case: { $eq: ["$hour", "Minute"] }, then: { $multiply: ["$time", 60] } },
            { case: { $eq: ["$hour", "Second"] }, then: "$time" }
          ],
          default: 0
        }
      }
    }
  },
  { $sort: { timeInSeconds: 1 } }
]);

const sortedRecipes = rawRecipes.map(r => new Recipt(r));

socket.emit('reciptebi', sortedRecipes);
  }

if (type === 'Ascending') {
  const rawRecipes = await Recipt.aggregate([
    { $match: { id: id } },
    {
      $addFields: {
        timeInSeconds: {
          $switch: {
            branches: [
              { case: { $eq: ["$hour", "Second"] }, then: "$time" },
              { case: { $eq: ["$hour", "Minute"] }, then: { $multiply: ["$time", 60] } },
              { case: { $eq: ["$hour", "Hour"] }, then: { $multiply: ["$time", 3600] } },
            ],
            default: 0
          }
        }
      }
    },
    { $sort: { timeInSeconds: -1 } } 
  ]);

  const sortedRecipes = rawRecipes.map(r => new Recipt(r));

  socket.emit('reciptebi', sortedRecipes);
}

}
if(value==='rating'){console.log('rating');
  if(type==='Decreasing'){
    const sortedRecipes = await Recipt.aggregate([
  { $match: { id: id } },   
  { $sort: { rate: 1 } }    
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));
socket.emit('reciptebi',sortedRecipess);
  }
  if(type==='Increasing'){
      const sortedRecipes = await Recipt.aggregate([
  { $match: { id: id } },   
  { $sort: { rate: -1 } }    
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));
socket.emit('reciptebi',sortedRecipess);
  }
}
if(value==='difficulty'){console.log('difficulty');
  if(type==='Decreasing'){
    const sortedRecipes = await Recipt.aggregate([
      { $match: { id: id } },
  {
    $addFields: {
      levelOrder: {
        $switch: {
          branches: [
            { case: { $eq: ["$level", "Easy"] }, then: 1 },
            { case: { $eq: ["$level", "Medium"] }, then: 2 },
            { case: { $eq: ["$level", "Hard"] }, then: 3 }
          ],
          default: 4
        }
      }
    }
  },
  { $sort: { levelOrder: 1 } } 
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));
socket.emit('reciptebi',sortedRecipess);

  }
  if(type==='Increasing'){
    const sortedRecipes = await Recipt.aggregate([
      { $match: { id: id } },
  {
    $addFields: {
      levelOrder: {
        $switch: {
          branches: [
            { case: { $eq: ["$level", "Easy"] }, then: 1 },
            { case: { $eq: ["$level", "Medium"] }, then: 2 },
            { case: { $eq: ["$level", "Hard"] }, then: 3 }
          ],
          default: 4
        }
      }
    }
  },
  { $sort: { levelOrder: -1 } } 
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));

socket.emit('reciptebi',sortedRecipess);
}
}

});
socket.on('addnew', async (recs) => {
  try {
 const imgBuffer = recs.img;  
    const mimeType = recs.imgstype; 
    console.log(mimeType,recs.imgstype);
 const fileName = `${recs.id}_${Date.now()}.${mimeType.split('/')[1]}`;
  const imageUrl = await uploadToS3(fileName, imgBuffer, mimeType);
console.log(imageUrl, "-----",recs.img);
    const newi = new Recipt({
      id: recs.id,
      idd: recs.idd,
      img: imageUrl,
      imgtype: recs.imgstype,
      title: recs.title,
      subtitle: recs.subtitle,
      time: recs.time,
      hour: recs.hour,
      rate: recs.rate,
      level: recs.level,
      amount: recs.amount,
      user: recs.user,
      timi:recs.timi
    });
    await newi.save();
    console.log('Saved:', recs.id);

    let ob=[];
    const a = await Recipes.find({id:recs.id});
    for(const element of a){
      const b = await User.findOne({user:element.user});
      ob.push({
        email:b.email,
        user:b.user,
        titl:recs.title
      });
    }
    socket.emit('aem',ob);
  } 
  catch (err) {
    console.error('Error saving recipe:', err);console.log('.');
  }
  const co = await Recipt.find({id:recs.id});
  io.to(recs.id).emit('reciptebi',co);

const a = await Recipes.find({id:recs.id});
let obj=[];
for(const element of a){
const t = await Recipt.find({id:recs.id,user:element.user});
obj.push({
  user:element.user,
  total:t.length
});
}
socket.join(recs.id);
io.to(recs.id).emit('ttlus',obj);
});

socket.on('desk',async(id,html)=>{console.log(id);
  const deki = new Desk({
    id:id,
    html:html.content
  });
  await deki.save();
});

socket.on('getdesk',async (id)=>{
  const dek = await Desk.findOne({id:id});
  const info = await Recipt.findOne({idd:id});
  socket.join(id);
  if(dek){
    socket.emit('getit',dek.html,info);
  }
});

socket.on('addrem',async (idi,id,user)=>{
const fav = await Favs.findOne({id:id,user:user});
if(fav){
  await Favs.deleteOne({id:id,user:user});
  socket.emit('faved','del');
  console.log('Deleted from favs!');
}
else{console.log('nope');
  socket.emit('faved','add');
  const haia = new Favs({
    idi:idi,
    id:id,
    user:user
  });
  await haia.save();
}
});

socket.on('chei',async(id,user)=>{
const hu = await Favs.findOne({id:id, user:user});
if(hu){
  socket.emit('vi','yes',id,user);
}
else{
  socket.emit('vi','no',id,user);
}
});

socket.on('remv', async (id,user)=>{
const haia = await Recipt.findOne({idd:id,user:user});
const mu = await Recipt.findOne({idd:id});
if(haia){
  socket.emit('meap',id,user);
}
else{
  socket.emit('meap','none',mu.user);
    console.log(4);

}
});

socket.on('dell', async (id,user)=>{
  const hai = await Recipt.findOne({idd:id});
  const hui = await Recipes.find({id:hai.id});

const users = await User.find({ user: { $in: hui.map(el => el.user) } });
const obj = users.map(u => ({ email: u.email, useri: u.user }));

  const fileNameFromUrl = hai.img.split('/').pop();
await deleteFromS3(fileNameFromUrl);

  await Recipt.deleteOne({idd:id});
  await Favs.deleteMany({id:id});
  await Rate.deleteMany({id:id});
  await Comments.deleteMany({id:id});
  await Details.deleteOne({idd:id});
console.log('Deleted');
socket.emit('delled',hai.title,obj,hai.idd);

const a = await Recipes.find({id:hai.id});
let objn=[];
for(const element of a){
const t = await Recipt.find({id:hai.id,user:element.user});
objn.push({
  user:element.user,
  total:t.length
});
}
socket.join(hai.id);
io.to(hai.id).emit('ttlus',objn);

});


socket.on('sende',async (user,useri,title)=>{console.log('senddd');
const usi = await User.findOne({user:user});
socket.emit('senkk',usi.email,user,useri,title);
});
app.post('/delete', async (req, res) => {
  const { email, responsee, title, user, useri, id } = req.body;
if(responsee==='no'){
    const hoi = await Recipt.findOne({idd:id});
    const hui = await Recipes.find({id:hoi.id});
const usernames = hui.map(el => el.user);
const users = await User.find({ user: { $in: usernames } });
  const obj = users.map(u => ({ email: u.email, useri: u.user }));
  console.log(responsee,obj,user,useri,hoi.title);
     await axios.post(
        'https://beckend2.onrender.com/valid',
        {response: responsee, object: obj,user:user, useri:useri, title:hoi.title} 
      );
}
else{
  console.log(responsee,user,useri);

    const hoi = await Recipt.findOne({idd:id});
    const hui = await Recipes.find({id:hoi.id});
const usernames = hui.map(el => el.user);

const users = await User.find({ user: { $in: usernames } });

const obj = users.map(u => ({ email: u.email, useri: u.user }));
  console.log(responsee,obj,user,useri,hoi.title);
   await axios.post(
        'https://beckend2.onrender.com/valid',
        {response: responsee, object: obj,user:user, useri:useri, title:hoi.title} 
      );

      const fileNameFromUrl = hoi.img.split('/').pop();
await deleteFromS3(fileNameFromUrl);

  await Recipt.deleteOne({idd:id});
  await Favs.deleteMany({id:id});
  await Rate.deleteMany({id:id});
  await Comments.deleteMany({id:id});
  await Details.deleteOne({idd:id});

  const a = await Recipes.find({id:hoi.id});
let objn=[];
for(const element of a){
const t = await Recipt.find({id:hoi.id,user:element.user});
objn.push({
  user:element.user,
  total:t.length
});
}
socket.join(hoi.id);
io.to(hoi.id).emit('ttlus',objn);

  io.emit('daio',id);

  console.log(id,email);
}

  res.json({ status: 'ok', message: `Email sent to ${email}` });
});



socket.on('cui',async (id,user)=>{
const ch = await Rate.findOne({id:id,user:user});
if(ch){
socket.emit('kkj','yes');  
}
else{
socket.emit('kkj','no');
}
});

socket.on('rtet',async (id,rate,user)=>{
const rat = await Recipt.findOne({idd:id});
const rati = ((rat.rate * rat.amount) + rate) / (rat.amount+ 1) ;
const rot = rat.amount+1;

await Recipt.updateOne(
  {idd:id},
  {$set: {rate:rati,amount:rot}}
);
const rty = new Rate({
  id:id,
  user:user
});
await rty.save();
console.log(`${user} rated!`);
});

socket.on('getfavs', async (id, user) => {
  try {
    const haia = await Favs.find({ idi: id, user: user });

    if (haia.length === 0) {
      socket.emit('aigefavs', []);
      return;
    }

    const recipeIds = haia.map(f => f.id);

    const recipes = await Recipt.find({ idd: { $in: recipeIds } });

    const obji = recipes.map(r => ({
      id: r.id,
      idd: r.idd,
      title: r.title,
      time: r.time,
      hour: r.hour,
      rate: r.rate,
      level: r.level,
      user: r.user
    }));

    socket.emit('aigefavs', obji);
  } catch (err) {
    console.error(err);
    socket.emit('aigefavs', []);
  }
});


socket.on('favv', async (user, id) => {
  try {
    const haia = await Favs.find({ idi: id, user: user });
    if (haia.length === 0) {
      socket.emit('reciptebi', []);
      return;
    }

    const recipeIds = haia.map(f => f.id);

    const recipes = await Recipt.find({ idd: { $in: recipeIds } });

    const ob = recipes.map(r => new Recipt({
      id: r.id,
      idd: r.idd,
      img: r.img,
      imgtype: r.imgtype,
      title: r.title,
      subtitle: r.subtitle,
      time: r.time,
      hour: r.hour,
      rate: r.rate,
      level: r.level,
      amount: r.amount,
      user: r.user
    }));

    socket.emit('reciptebi', ob);
  } catch (err) {
    console.error(err);
    socket.emit('reciptebi', []); 
  }
});

socket.on('comment', async (id,user,comment,date,idd)=>{
const comm = new Comments({
  id:id,
  user:user,
  comment:comment,
  date:date,
  idd:idd
});
await comm.save();
socket.join(id);
const comms = await Comments.find({id:id});
console.log(`user ${user} added comment ${comment}`);
io.to(id).emit('koment',comms);
});

socket.on('comms',async (id,user)=>{                                             
const comms = await Comments.find({id:id});
socket.join(id);
console.log(id,user);
console.log(comms.length);
io.to(id).emit('koment',comms);
});

socket.on('editt',async (id,idd)=>{
const comm = await Comments.findOne({id:id,idd:idd});
socket.emit('editit',id,idd,comm.comment);
});

socket.on('shecv',async (id,idd,comment)=>{
  await Comments.updateOne(
    {
    id:id,
    idd:idd
    },
    {$set: {comment:comment}}
  );
const comm = await Comments.find({id:id});
socket.join(id);
io.to(id).emit('koment',comm);
});

socket.on('delcom',async (id,idd)=>{
await Comments.deleteOne({id:id,idd:idd});
console.log('message deleted!');
const comm = await Comments.find({id:id});
socket.join(id);
io.to(id).emit('koment',comm);
});

socket.on('wash',async (id,user)=>{
  const a = await Recipes.findOne({id:id});
socket.emit('shlis',id,user,a.name);
});

socket.on('washala',async (id,user)=>{
const haia = await Recipt.find({id:id});
await Recipes.deleteOne({id:id,user:user});
await Recipt.deleteMany({id:id});
for(const element of haia){
await Comments.deleteMany({id:element.id});
await Rate.deleteMany({id:element.id});
await Details.deleteMany({id:element.id});
}
console.log(`${user} removed list!`);
const taskss = await Recipes.find({user:user});
socket.emit('loaded', taskss);
});

socket.on('lusers',async (id,user)=>{
const a = await Recipes.find({id:id});
let obj=[];
for(const element of a){
const t = await Recipt.find({id:id,user:element.user});
obj.push({
  user:element.user,
  total:t.length
});
}
socket.emit('ttlus',obj);
});

socket.on('detail',async (id,idd,user,details)=>{
const hai = await Details.findOne({idd:idd});
console.log('ipova?-',hai);
if(!hai){
const haia = new Details({
  id:id,
  idd:idd,
  user:user,
  details:details
});
await haia.save();
console.log('addednew');
}
console.log('Details saved!');
});

socket.on('dets',async (id)=>{
const haia = await Details.findOne({idd:id});
if(haia){
socket.emit('ddts',haia.details);
}
else{
socket.emit('ddts',[]);
}
});

socket.on('friends',async (user)=>{
const frnds = await Friends.find({user:user});
if(frnds){
   for(const element of frnds){
    const us = await User.findOne({user:element.friend});
    console.log(`${element.friend} act ${us.active}`);
    if(us.active){
    await Friends.updateOne(
      {friend:element.friend},
      {$set:{active:us.active}}
    );
  }
   }
   const frndds = await Friends.find({user:user});
   socket.emit('dafr',frndds,'all');

  setInterval(async () => {
   const frndss = await Friends.find({user:user});
   for(const element of frndss){
    const us = await User.findOne({user:element.friend});
        console.log(`${element.friend} act ${us.active}`);
    if(us.active){
    await Friends.updateOne(
      {friend:element.friend},
      {$set:{active:us.active}}

    );
  }
   }
   const frndds = await Friends.find({user:user});
   socket.emit('dafr',frndds,'all');
  }, 60000);
}
else{
  socket.emit('dafr',[],'none');
}
});

socket.on('delfr',async (user,friend)=>{
await Friends.deleteOne({user:user,friend:friend});
await Friends.deleteOne({user:friend,friend:user});
console.log('deleted chat!');
});

socket.on('searrrc', async (term,user, id) => {
    const result = await Friends.find({
      user:user,
      friend: { $regex: '^' + term, $options: 'i' }
    });
   socket.emit('dafr',result,'all');
  });

  socket.on('ldrq',async (user)=>{
    const haia = await Requests.find({rec:user});
    if(haia){
      socket.emit('dafr',haia,'reqs');
    }
  });

  socket.on('remreq',async(user,rec)=>{
    await Requests.deleteOne({send:user,rec:rec});
    await Requests.deleteOne({send:rec,rec:user});
    console.log('Friend request deleted!');
    const haia = await Requests.find({rec:rec});
    socket.emit('dafr',haia,'reqs');
  });

 socket.on('searre', async (term, user) => {
  const result = await User.find({
    user: { $regex: '^' + term, $options: 'i' }
  });

  const users = result.map(el => el.user);
  
  const fr = await Friends.find({user:user});
  const frs = fr.map(f => f.friend);
  
  const requests = await Requests.find({
    send: user,
    rec: { $in: users, $nin: frs }
  });
  const recusers = requests.map(r => r.rec);
  
  socket.emit('SeS', result, recusers);
});


  socket.on('Sendr',async (me,to)=>{
    const h = await Requests.findOne({send:me,rec:to});
    if(!h){
      const addi = new Requests({
        send:me,
        rec:to
      });
      await addi.save();
    }
  });

  socket.on('addfrn',async (id,me,to)=>{
    const ta = await User.findOne({user:me});
    const tu = await User.findOne({user:to});
   const ha = new Friends({
    id:id,
    user:me,
    friend:to,
    active:ta.active
   });
   await ha.save();

   const hu = new Friends({
    id:id,
    user:to,
    friend:me,
    active:tu.active
   });
   hu.save();
   const jo = await Friends.find({user:me});
   socket.emit('dafr',jo,'all');
  });

  socket.on('gagzavne',async (id,sender,receiver,message,date)=>{
    const mess = new Message({
      id:id,
      sender:sender,
      receiver:receiver,
      message:message,
      date:date
    });
    await mess.save();
    console.log('message saved!');
    const messs = await Message.find({id:id});
    if(messs.length>30){
      await Message.findOneAndDelete({id:id},{sort:{createdAt:1}});
    }
    socket.emit('Newmes',messs);
  });

  socket.on('loadmasi',async (id)=>{
    const haia = await Message.find({id:id});
      socket.emit('Newmes',haia);
  });

  socket.on('edtg',async (id,sender,rec,mess,newme)=>{
      await Message.updateOne(
    {
    id:id,
    sender:sender,
    receiver:rec,
    message:mess,
    },
    {$set: {message:newme}}
  );
  const haia = await Message.find({id:id});
  console.log(id,sender,rec,mess);
  socket.emit('Newmes',haia);
  });

  socket.on('delo',async (id,send,rec,mess)=>{
    await Message.deleteOne({id:id,sender:send,receiver:rec,message:mess});
    console.log("deleted message",id);
    const haia = await Message.find({id:id});
    if(isImageUrl(mess)){
      const fileNameFromUrl = mess.split('/').pop();
await deleteFromS3(fileNameFromUrl);
console.log('deleted from s3!');
    }
    socket.emit('Newmes',haia);
  });

socket.on('gagzavnu', async (id,sender,receiver,img,ty,date) => {
   const fileName = `${id}_${Date.now()}.${ty.split('/')[1]}`;
  const imageUrl = await uploadToS3(fileName, img, ty);

  const rec = new Message({
    id: id,
    sender: sender,
    receiver: receiver,
    message: imageUrl,
    date: date
});
await rec.save();
console.log('message saved!');
 const messs = await Message.find({id:id});
    if(messs.length>30){
      const a = await Message.findOne({id:id},{sort:{createdAt:1}});
      if(isImageUrl(a.message)){
        const fileNameFromUrl = hai.img.split('/').pop();
await deleteFromS3(fileNameFromUrl);
console.log('deleted from s3!');
      }
      await Message.findOneAndDelete({id:id},{sort:{createdAt:1}});
    }

    const haia = await Message.find({id:id});
     socket.emit('Newmes',haia);

});

function isImageUrl(url) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
}

});
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});