const bcrypt = require("bcrypt");
const { validationResult, matchedData } = require("express-validator");
const User = require("../models/user");

const idRegex = /[0-9]+/;

module.exports = {
    signin: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);

        const user = await User.findOne({ where: { email: data.email } });

        if (!user) {
            res.json({ error: "Email e/ou senha inválidos" });
            return;
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);

        if (!isValid) {
            res.json({ error: "Email e/ou senha inválidos" });
            return;
        }

        const payLoad = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payLoad, 10);

        user.token = token;
        await user.save();

        res.json({
            token,
            email: data.email,
        });
    },

    signup: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);

        const user = await User.findOne({
            where: {
                email: data.email,
            },
        });

        if (user) {
            res.json({ error: "Email já cadastrado" });
            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const payLoad = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payLoad, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            isAdmin: data.isAdmin,
            passwordHash,
            token,
        });

        await newUser.save();

        res.json({ token });
    },
};
