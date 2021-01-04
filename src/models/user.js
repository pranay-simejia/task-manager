const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value)) throw new Error('Not a valid email.');
			},
		},
		password: {
			type: String,
			trim: true,
			required: true,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error(' Your password cannot contain "password"');
				}
				if (value.length < 6) {
					throw new Error('Your password must be of atleast 7 characters');
				}
			},
		},
		age: {
			type: Number,
			validate(value) {
				if (value < 0) {
					throw new Error('Please enter a valid age');
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: {
			type: Buffer,
		},
	},
	{ timestamps: true }
);

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner',
});

userSchema.methods.generateAuthToken = async function () {
	const token = jwt.sign({ _id: this.id.toString() }, process.env.JWT_SECRET);

	this.tokens = this.tokens.concat({ token });
	await this.save();

	return token;
};

userSchema.methods.toJSON = function () {
	const publicUser = this.toObject();
	delete publicUser.password;
	delete publicUser.tokens;
	delete publicUser.avatar;
	return publicUser;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error('Error logging in');
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('username or password donot match');
	}
	return user;
};

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	next();
});
userSchema.pre('remove', async function (next) {
	await Task.deleteMany({ owner: this._id });
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
