// app.js (KOBY API - مُعدل ليعرض HTML على Vercel)

const express = require('express');
const { igdl } = require('btch-downloader'); 
const cors = require('cors'); 

const app = express();
app.use(cors());
app.use(express.json());

// *******************************************************************
// 🔑 دالة المعالجة الأساسية
// *******************************************************************
async function processInstagramLink(url) {
    try {
        let result = await igdl(url); 
        return result; 
    } catch (error) {
        console.error("Error during igdl call:", error);
        return { 
            status: 'error', 
            message: 'فشل في استدعاء المكتبة الخارجية: ' + error.message 
        };
    }
}
// *******************************************************************


// 🚨 المسار الأساسي: يستقبل GET /?url= ويعرض إما الواجهة أو النتيجة المنسقة
app.get('/', async (req, res) => {
    const link = req.query.url; 

    // ----------------------------------------------------------------
    // 1. عرض واجهة الإدخال إذا لم يتم إرسال رابط
    // ----------------------------------------------------------------
    if (!link) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>✨ KOBY Downloader API ✨</title>
                <style>
                    body { font-family: Tahoma, sans-serif; text-align: center; margin: 50px; background-color: #1a1a1a; color: #f0f0f0; }
                    .container { background: #2c2c2c; padding: 30px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.4); max-width: 650px; margin: auto; }
                    h1 { color: #87ceeb; }
                    input[type="text"] { width: 85%; padding: 12px; margin-bottom: 20px; border: 1px solid #555; border-radius: 6px; background-color: #3e3e3e; color: #fff; }
                    button { padding: 12px 25px; background-color: #87ceeb; color: #1a1a1a; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.3s; }
                    button:hover { background-color: #6a95b8; }
                    pre { text-align: left; padding: 10px; background-color: #111; border-radius: 4px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✨ معالج الروابط KOBY ✨</h1>
                    <p>الرجاء إدخال رابط الانستغرام للمعالجة:</p>
                    <form action="/" method="GET">
                        <input type="text" name="url" placeholder="ألصق رابط إنستغرام هنا..." required>
                        <button type="submit">معالجة الرابط</button>
                    </form>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #bbb;">أو استخدم الرابط مباشرة: [رابط Vercel]/?url=...</p>
                </div>
            </body>
            </html>
        `);
    }

    // ----------------------------------------------------------------
    // 2. معالجة الرابط وعرض النتيجة المنسقة
    // ----------------------------------------------------------------
    try {
        const result = await processInstagramLink(link); 
        
        let htmlOutput = `<h1>✅ نتيجة المعالجة</h1>`;
        htmlOutput += `<p><strong>الرابط المعالج:</strong> ${link}</p>`;
        
        // التحقق من وجود الوسائط وعرضها في جدول
        if (result.medias && result.medias.length > 0) {
            htmlOutput += '<table border="1" style="width:90%; margin: 20px auto; text-align: right; direction: rtl; border-collapse: collapse;">';
            htmlOutput += '<tr><th style="background-color: #555; color: white; padding: 10px;">العنصر</th><th style="background-color: #555; color: white;">الرابط</th></tr>';
            
            result.medias.forEach((media, index) => {
                const mediaType = media.extension === 'mp4' ? 'فيديو 🎬' : 'صورة 🖼️';
                htmlOutput += `
                    <tr>
                        <td style="padding: 8px; background-color: #444;">${mediaType} #${index + 1}</td>
                        <td style="padding: 8px; background-color: #444;"><a href="${media.url}" target="_blank" style="color: #87ceeb;">رابط التنزيل</a></td>
                    </tr>
                `;
            });
            htmlOutput += '</table>';
        } else {
             htmlOutput += `<p style="color: #f0f0f0;">لم يتم العثور على وسائط قابلة للتنزيل. قد تكون البيانات في القسم الخام أدناه.</p>`;
        }
        
        // عرض النتيجة الخام للمطورين
        htmlOutput += `<h2>البيانات الخام (JSON)</h2>`;
        htmlOutput += `<pre>${JSON.stringify(result, null, 2)}</pre>`;


        // إرسال الرد المنسق
        res.send(
            `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>نتيجة KOBY</title><style>
            body { font-family: Tahoma, sans-serif; margin: 0; padding: 0; background-color: #1a1a1a; color: #f0ff0f; }
            .container-output { background: #2c2c2c; padding: 30px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.4); max-width: 900px; margin: 40px auto; }
            h1, h2 { color: #87ceeb; text-align: center; }
            pre { text-align: left; padding: 15px; background-color: #111; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; font-size: 0.9em; }
            table { border-collapse: collapse; }
            a { color: #87ceeb; text-decoration: none; }
            </style></head><body><div class="container-output">${htmlOutput}</div></body></html>`
        );

    } catch (error) {
        // في حالة فشل الخادم
        res.status(500).send(`
            <h1>❌ خطأ في المعالجة</h1>
            <p>فشل الخادم في معالجة طلب المكتبة. تحقق من الرابط.</p>
            <p><strong>التفاصيل:</strong> ${error.message}</p>
        `);
    }
});

// 🚨 تصدير التطبيق كوحدة نمطية (Module) للعمل على Vercel
module.exports = app; 
