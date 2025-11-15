// app.js

// 🚨 استخدام require للمكتبات
const express = require('express');
const { igdl } = require('btch-downloader'); 
const app = express();
const PORT = 3000;
// تم حذف تعريف HOST = 'kobi.local'


// *******************************************************************
// 🔑 دالة المعالجة التي تستخدم المكتبة الحقيقية
// *******************************************************************
async function processInstagramLink(url) {
    try {
        // 1. إجراء استدعاء المكتبة وإرسال الرابط
        let result = await igdl(url); 
        
        // 2. إرجاع النتيجة مباشرة (JSON)
        return result; 
    } catch (error) {
        console.error("Error during igdl call:", error);
        // في حالة فشل المكتبة، نُرجع كائن خطأ واضح
        return { 
            status: 'error', 
            message: 'فشل في استدعاء المكتبة الخارجية: ' + error.message 
        };
    }
}
// *******************************************************************


// 1. إعداد الخادم لاستقبال بيانات JSON من الواجهة الأمامية
app.use(express.json());

// 2. الواجهة الرئيسية (GET Request) - كود HTML و CSS و JavaScript
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>معالج رابط انستغرام</title>
            <style>
                body { font-family: Tahoma, sans-serif; background-color: #1f2029; color: #fff; text-align: center; padding-top: 50px; }
                .container { background: #282a36; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.5); width: 90%; max-width: 700px; margin: auto; }
                input[type="text"] { width: 90%; padding: 12px; margin: 15px 0; border: none; border-radius: 5px; background: #3c3f50; color: #f8f8f2; }
                button { background-color: #833AB4; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1.1em; transition: background-color 0.3s; }
                button:hover { background-color: #C13584; }
                pre { background: #1e1e1e; color: #50fa7b; padding: 20px; border-radius: 5px; text-align: left; white-space: pre-wrap; word-wrap: break-word; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>معالج رابط انستغرام 📸</h1>
                <p>أدخل رابط انستغرام لتحصل على نتيجة JSON.</p>
                <form id="link-form">
                    <input type="text" id="link-input" name="link" placeholder="الصق رابط انستغرام هنا..." required>
                    <button type="submit">إرسال الرابط للمعالجة</button>
                </form>

                <hr style="border-color: #44475a; margin: 30px 0;">
                <h2>النتيجة (JSON)</h2>
                <pre id="json-result">النتيجة ستظهر هنا...</pre>
            </div>

            <script>
                document.getElementById('link-form').addEventListener('submit', async function(event) {
                    event.preventDefault(); 
                    const link = document.getElementById('link-input').value;
                    const resultElement = document.getElementById('json-result');
                    resultElement.textContent = 'جاري المعالجة...';

                    try {
                        const response = await fetch('/process', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ link: link }),
                        });

                        const data = await response.json();
                        resultElement.textContent = JSON.stringify(data, null, 4);
                    } catch (error) {
                        resultElement.textContent = '❌ حدث خطأ: ' + error.message;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// 3. مسار معالجة الرابط (POST Request)
app.post('/process', async (req, res) => {
    const link = req.body.link;

    if (!link) {
        return res.status(400).json({ status: 'error', message: 'لم يتم إرسال رابط.' });
    }

    try {
        // استدعاء دالة المعالجة التي تستخدم المكتبة
        const result = await processInstagramLink(link); 
        
        // إرسال النتيجة كما هي
        res.json(result); 

    } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({ status: 'error', message: 'فشل الخادم في معالجة طلب المكتبة.' });
    }
});

// 4. تشغيل الخادم (الاستماع إلى localhost)
app.listen(PORT, () => {
    console.log(`🚀 تم تشغيل التطبيق! افتح الرابط: http://localhost:${PORT}`);
});