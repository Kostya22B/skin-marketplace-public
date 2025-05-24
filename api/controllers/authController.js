const { google } = require('googleapis');
const User = require('../models/userModel');
const envFile = process.env.NODE_ENV === 'uat' ? '.env.uat' : '.env';
require('dotenv').config({ path: envFile });


const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

exports.login = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'online',
        scope: [
            'userinfo.profile',
            'userinfo.email',
            'openid'
        ],
    });
    res.redirect(url);
};

exports.callback = async (req, res) => {
    const code = req.query.code;
    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({
                auth: oauth2Client,
                version: 'v2'
            });
            const userInfo = await oauth2.userinfo.get();
            
            const [user, created] = await User.findOrCreate({
                where: { email: userInfo.data.email },
                defaults: {
                    email: userInfo.data.email,
                    name: userInfo.data.name || 'Anonymous',
                    picture: userInfo.data.picture || null,
                    googleId: userInfo.data.id,
                }
            });
            
            req.session.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                coinsBalance: user.coinsBalance,
                telegramId: user.telegramId,
                telegramName: user.telegramName,
                role: user.role
            };
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/');
            });         
        } catch (error) {
            console.error("Error retrieving access token", error);
            res.status(500).send("Error during authentication");
        }
    } else {
        res.status(400).send("No code received");
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Logout error");
        }
        res.clearCookie('connect.sid');
        res.status(200).send("Logged out");
    });
};

exports.checkAuth = (req, res) => {
    if (req.session.user) {
        res.status(200).json({ authorized: true });
    } else {
        res.status(401).json({ authorized: false });
    }
};
