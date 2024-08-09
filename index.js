// index.js

const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// وظيفة لمساعدتك في تحميل الصور من URL
async function loadImageFromURL(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const image = await loadImage(Buffer.from(response.data, 'binary'));
    return image;
}

app.get('/api/makers/levelup', async (req, res) => {
    try {
        const { avatar, background, username, levels } = req.query;

        if (!avatar || !background || !username || !levels) {
            return res.status(400).json({ error: 'Missing query parameters' });
        }

        const [levelOld, levelNew] = levels.split(',');

        // تحميل الصور (الخلفية والصورة الرمزية)
        const backgroundImg = await loadImageFromURL(background);
        const avatarImg = await loadImageFromURL(avatar);

        // إعداد الكانفاس
        const canvasWidth = 800;
        const canvasHeight = 600;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // رسم الخلفية
        ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

        // رسم الصورة الرمزية بشكل دائري
        const avatarSize = 150;
        const avatarX = 50;
        const avatarY = 50;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // إعداد النصوص
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(username, 220, 100);

        ctx.font = 'bold 35px Arial';
        ctx.fillStyle = '#FFFF00';
        ctx.fillText(`Level Up!`, 220, 150);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`From ${levelOld} to ${levelNew}`, 220, 200);

        // إخراج الصورة
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(canvas.toBuffer());

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create image' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
