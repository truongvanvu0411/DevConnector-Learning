const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { profile_url } = require('gravatar');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

//@route POST api/posts
//@desc Create posts
//@access private

router.post(
  '/',
  [auth, [check('text', ' Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route GET api/posts
//@desc Get all posts
//@access private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ date: -1 });

    if (!posts) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route GET api/posts/:pos_id
//@desc Get post by id
//@access private

router.get('/:pos_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pos_id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PostId not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route DELETE api/posts/:pos_id
//@desc Delete post by id
//@access private

router.delete('/:pos_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pos_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //Check user author
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No authorized' });
    }

    await post.remove();
    res.json({ msg: 'Delete success' });

    // res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PostId not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route PUT api/posts/like
//@desc Add like to the post
//@access private

router.put('/like/:pos_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pos_id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    //Check user have like or not
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Already liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PostId not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route PUT api/posts/unlike
//@desc Remove like from the post
//@access private

router.put('/unlike/:pos_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pos_id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    //Check user have like or not
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get removeIndex
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    if (removeIndex === -1) {
      return res.status(400).json({ msg: 'No such entity' });
    }

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PostId not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route PUT api/posts/comment/:pos_id
//@desc Create comment
//@access private

router.put(
  '/comment/:pos_id',
  [auth, [check('text', ' Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.pos_id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      //Put new comment on top of list
      post.comments.unshift(newComment);

      post.save();

      res.json(post);
    } catch (error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'PostId not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

//@route PUT api/posts/comment/:pos_id/:com_id
//@desc Remove comment from post
//@access private

router.delete('/comment/:pos_id/:com_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.pos_id);
    // console.log(post.comments);

    //Pull out all comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.com_id
    );

    //Make sure comment exist
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    //Check user have author
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'No Authorized' });
    }

    // Get removeIndex
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    if (removeIndex === -1) {
      return res.status(400).json({ msg: 'No such entity' });
    }

    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PostId not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
