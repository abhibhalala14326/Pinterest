var express = require('express');
var router = express.Router();
const UserModel = require("../model/UserModel");
const PostModel = require("../model/postModel.js");
const passport = require('passport');
const localStrategy = require("passport-local")
const upload = require("../multer/upload.js")
let cloudinary = require('cloudinary').v2;


passport.use(new localStrategy(UserModel.authenticate("local")))

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

// Get Register Page
router.get('/register', async function (req, res, next) {
  res.render('register', {nav: false });
});


// Get Error Page
router.get('/404', async function (req, res, next) {

  res.render('404', { nav: false });
});

// Get Profile Page 
router.get('/profile', IsLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user
  }).populate("posts");
  console.log(user);

  res.render('profile', { user, nav: true }
  );
});


// Get Posts Page
router.get("/post/:id", IsLoggedIn, async function (req, res, next) {
  try {
    const post = await PostModel.findById(req.params.id).populate("user");
    const user = await UserModel.findOne({ username: req.session.passport.user });

    if (!post) {
      return res.status(404).render("404", { nav: true });
    }

    res.render("singlepost", { post, user, nav: true });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Something went wrong");
  }
});

// Update User Data

router.get("/edit", IsLoggedIn, async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  res.render("edit", { user, nav: true });
});


router.post("/edit", IsLoggedIn, async (req, res) => {
  const { fullname, email, contact } = req.body;

  try {
    const user = await UserModel.findOne({ username: req.session.passport.user });
    user.name = fullname;
    user.email = email;
    user.contact = contact;
    await user.save();

    res.redirect("/profile");
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).send("Something went wrong.");
  }
});



// Get Feed Page

router.get('/feed', IsLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user
  })

  const posts = await PostModel.find().populate("user")

  res.render('feed', { user,posts, nav: true }
  );
});

// Get All post 
router.get('/show/posts', IsLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user
  }).populate("posts");
  console.log(user);

  res.render('show', { user, nav: true }
  );
});

// Create A New Post
router.post('/createpost', IsLoggedIn, upload.single("postimage"), async function (req, res, next) {
  let { title, description, user } = req.body;
  const users = await UserModel.findOne({
    username: req.session.passport.user
  })

  let file = req.file.path

  let PostImageg = await cloudinary.uploader.upload(file,{
    resource_type:"auto"
  })

  console.log( PostImageg.secure_url)
  

  const createPost = await PostModel.create({
    user: users._id,
    title,
    description,
    image: PostImageg.secure_url
  })

  users.posts.push(createPost._id)
  await users.save()

  res.redirect('/profile');
});

// 
router.get('/add', IsLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user
  })
  res.render('add', { user, nav: true }
  );
});

// Upload ProfileImage

router.post('/fileupload', IsLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user
  })

  let file = req.file.path

  let profilePIC = await cloudinary.uploader.upload(file, {
    resource_type: "auto"
  })

  user.profilePicture = profilePIC.secure_url
  await user.save()

  console.log(user);

  res.redirect("/profile",)

});

// Password Validate 
function validatePassword(password) {
  const minLength = 8;
  const hasNumber = /\d/;
  const hasUpper = /[A-Z]/;
  const hasLower = /[a-z]/;

  if (password.length < minLength) return "Password must be at least 8 characters.";
  if (!hasNumber.test(password)) return "Password must include at least one number.";
  if (!hasUpper.test(password)) return "Password must include at least one uppercase letter.";
  if (!hasLower.test(password)) return "Password must include at least one lowercase letter.";

  return null;
}

// Register Router
router.post("/register", async function (req, res, next) {
  const { username, email, password, contact  } = req.body;

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).send({ message: passwordError });
  }

  try {
    const user = new UserModel({ username, email, contact ,name:req.body.fullname});
    await UserModel.register(user, password); // handles password hashing internally

    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send({ message: "Registration failed", error: err.message });
  }
});


// Login Router
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
  successFlash: true
}), async function (req, res, next) {

});


// Logout Router
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect("/")
  })
})

// IsLoggedIn function 

function IsLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect("/")
}

module.exports = router;
