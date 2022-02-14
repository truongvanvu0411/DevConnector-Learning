const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

//@route POST api/user
//@desc Register user
//access Public

const User = require('../../models/User');

router.post(
  '/',
  [
    check('name', 'User is require').not().isEmpty(),
    check('email', 'Please input valid email').isEmail(),
    check(
      'password',
      'Please input enter password with 6 or more character '
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(401)
          .json({ errors: [{ msg: ' User already exist ' }] });
      }
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      user = new User({
        name,
        email,
        password,
        avatar,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      //Get users Gravatar

      //Encrypt password

      //Return Json Web Token
    } catch (error) {
      return res.status(500).send('Server error');
    }
  }
);

//@route GET api/user/
//@desc get all user
//@access public

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(400).json({ msg: 'Khong co user o day' });
    }

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
