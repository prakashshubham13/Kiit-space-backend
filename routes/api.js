const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//VerifyToken
function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request');
  }
  let token = req.headers.authorization.split(' ')[1];
  if (token === 'null') return res.status(401).send('Unauthorized request');
  let payload = jwt.verify(token, 'secretKey');
  if (!payload) return res.status(401).send('Unauthorized request');
  req.decoded = payload;
  next();
}

//register user
router.post('/', async (req, res) => {
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  const data = new User(req.body);
  try {
    let user = await User.findOne({$or:[{ email: data.email },{ username: data.username}]});
    console.log(user);
    if (user) res.status(401).json({ result: 'Credentials already taken' });
    else {
      const savePost = await data.save();
      console.log(savePost);
      let payload = { subject: savePost._id, username: savePost.username };
      let token = jwt.sign(payload, 'secretKey');
      console.log('====================================');

      console.log('====================================');
      res
        .status(200)
        .send({ token: token, id: savePost._id, username: savePost.username });
    }
  } catch (err) {
    res.status(500).json(error);
  }
});

//reset password
// router.post('/reset', async (req, res) => {
//   const data = new User(req.body);

//   try {
//     let user = await User.findOne({ email: data.username });
//     console.log('====================================');
//     console.log(data);
//     console.log('====================================');
//     console.log(user);
//     console.log('====================================');
//     console.log('====================================');
//     if (user) {
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: 'tonystank82129@gmail.com',
//           pass: 'Logan@13',
//         },
//       });
//       var mailOptions = {
//         from: 'tonystank82129@gmail.com',
//         to: data.username,
//         subject: 'Kiit Space forget password request',
//         text: 'That was easy!',
//         html: `<b>Hey! your <span style=""color:'skyblue'">Kiit Space</span> password is: </b> <br> ${user.password}<br/><img src="https://images.unsplash.com/photo-1583766395091-2eb9994ed094?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fG1vZGVsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60"></br>Have a great day!!`,
//       };
//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           console.log(error);
//         } else {
//           res.status(401).json({ result: 'Password reset successful' });
//         }
//       });
//     } else {
//       res.status(200).send({ result: 'Enter registered email id' });
//     }
//   } catch (err) {
//     res.status(500).json(error);
//   }
// });

//Get All Blogs
router.get('/blogs', verifyToken, async (req, res) => {
  try {
    let post = await Post.find({ private: false });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Get blogs by id
router.get('/getsingleblog:id', verifyToken, async (req, res) => {
  try {
    let post = await Post.findOne({ _id: req.params.id });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Get My Blogs
router.get('/myblogs', verifyToken, async (req, res) => {
  try {
    let post = await Post.find({ creator_id: req.decoded.subject });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Get Public Blogs
router.get('/publicblogs:username', verifyToken, async (req, res) => {
  try {
    let post = await Post.find({
      creator_name: req.params.username,
      private: false,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Get Profile Details
router.get('/profile', verifyToken, async (req, res) => {
  try {
    let post = await User.findOne({ _id: req.decoded.subject });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Get Public Profile Details
router.get('/publicprofile:username', verifyToken, async (req, res) => {
  try {
    let post = await User.findOne({ username: req.params.username });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Add Bload
router.post('/addblog', verifyToken, async (req, res) => {
  const data = new Post(req.body);
  data.creator_id = req.decoded.subject;

  try {
    const saveBlog = await data.save();
    res.status(200).send({ mssg: 'Upload successful' });
  } catch (err) {
    res.status(500).json(error);
  }
});

//comment on blog
router.post('/commentpost', verifyToken, async (req, res) => {
  try {
    let post = await Post.findOne({ _id: req.body.id });
    post.commentcount++;
    let commentdata = {
      comment: req.body.comment,
      commentator: req.decoded.username,
    };
    post.comments.push(commentdata);
    const saveBlog = await post.save();
    res.status(200).send(saveBlog);
  } catch (err) {
    res.status(500).json(error);
  }
});

//like a blog
router.post('/likeblog', verifyToken, async (req, res) => {
  try {
    console.log('like api');
    let post = await Post.findOne({ _id: req.body.id });
    console.log(req.body.id);
    console.log(post);
    post.likes++;
    console.log(post.likes);
    post.likedby.push(req.decoded.username);
    console.log(post.likedby);
    console.log(post.dislikedby.indexOf(req.decoded.username));
    if (post.dislikedby.indexOf(req.decoded.username) > -1) {
      post.dislikedby.splice(post.dislikedby.indexOf(req.decoded.username), 1);
      post.dislikes--;
      console.log(post.dislikes);
    }
    console.log(post.likes);
    const saveBlog = await post.save();
    res.status(200).send(saveBlog);
  } catch (err) {
    res.status(500).json(error);
  }
});

//unlike a blog
router.post('/unlikeblog', verifyToken, async (req, res) => {
  try {
    let post = await Post.findOne({ _id: req.body.id });
    post.dislikes++;
    post.dislikedby.push(req.decoded.username);
    if (post.likedby.indexOf(req.decoded.username) > -1) {
      post.likes--;
      const arrayIndex = post.likedby.indexOf(req.decoded.username);
      post.likedby.splice(arrayIndex, 1);
    }
    const saveBlog = await post.save();
    res.status(200).send(saveBlog);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Toggle Private
router.post('/updatevisible', async (req, res) => {
  try {
    const updateBlog = await Post.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: { private: req.body.value },
      },
      { new: true }
    );
    res.status(200).send(updateBlog);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Edit Blog
router.post('/editblog', verifyToken, async (req, res) => {
  try {
    const updateBlog = await Post.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          subject: req.body.subject,
          tags: req.body.tags,
        },
      },
      { new: true }
    );
    res.status(200).json(updateBlog);
  } catch (err) {
    res.status(500).json(error);
  }
});

// //Edit Blog comment
router.post('/editblogcomment', verifyToken, async (req, res) => {
  try {
    console.log(req.body);
    const updateBlog = await Post.updateOne(
      { _id: req.body.postid, 'comments._id': req.body.commentid },
      { $set: { 'comments.$.comment': req.body.comment } }
    );
    res.status(200).json(updateBlog);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Delete blog comment
router.post('/deleteblogcomment', async (req, res) => {
  console.log('delete comment');
  console.log(req.body);
  try {
    const deleteBlog = await Post.findByIdAndUpdate(
      { _id: req.body.postid },
      {
        $pull: {
          comments: {
            _id: req.body.commentid,
          },
        },
      }
    );
    let post = await Post.findOne({ _id: req.body.postid });
    post.commentcount--;
    console.log('ans' + deleteBlog);

    const save = await post.save();
    res.status(200).send({ mssg: 'Deleted Successfully' });
  } catch (err) {
    res.status(500).json(error);
  }
});

//Update profile email
router.post('/updateprofile', verifyToken, async (req, res) => {
  try {
    const updateProfile = await User.findOneAndUpdate(
      { _id: req.decoded.subject },
      {
        $set: { email: req.body.email },
      },
      { new: true }
    );
    res.status(200).json(updateProfile);
  } catch (err) {
    res.status(500).json(error);
  }
});

//Update profile passowrd
router.post('/updateprofilepassword', verifyToken, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.decoded.subject });

    if (user.password === req.body.oldpassword) {
      const updateProfile = await User.findOneAndUpdate(
        { _id: req.decoded.subject },
        {
          $set: { password: req.body.newpassword },
        },
        { new: true }
      );
      res.status(200).json(updateProfile);
    } else res.status(401).json({ result: 'wrong password' });
  } catch (err) {
    res.status(500).json(error);
  }
});

//Delete blog
router.post('/deleteblog', async (req, res) => {
  try {
    const deleteBlog = await Post.findOneAndDelete({
      _id: req.body.id,
    });
    res.status(200).send({ mssg: 'Deleted Successfully' });
  } catch (err) {
    res.status(500).json(error);
  }
});

//Delete User
router.post('/deleteuser', verifyToken, async (req, res) => {
  try {
    const deleteUser = await User.findOneAndDelete({
      _id: req.decoded.subject,
    });
    res.status(200).send({ mssg: 'Deleted Successfully' });
  } catch (err) {
    res.status(500).json(error);
  }
});

//login
router.post('/login', async (req, res) => {
  const data = req.body;
  try {
    let user = await User.findOne({ username: data.username });
    if (!user) res.status(401).json({ result: 'no user' });
    else {
      if (user.password !== data.password)
        res.status(401).json({ result: 'wrong password' });
      else {
        let payload = { subject: user._id, username: user.username };
        let token = jwt.sign(payload, 'secretKey');
        res
          .status(200)
          .send({ token: token, id: user._id, username: user.username });
      }
    }
  } catch (err) {
    res.status(500).json(error);
  }
});

module.exports = router;
