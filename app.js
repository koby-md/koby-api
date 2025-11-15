// app.js (KOBY API - مُعدل ليعرض JSON الخام فقط)

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


// 🚨 المسار الأساسي: يستقبل GET /?url= ويعرض النتيجة كـ JSON خام
app.get('/', async (req, res) => {
    // 🔑 الآن نستخدم req.query.url لاستقبال البارامتر
    const link = req.query.url; 

    // ----------------------------------------------------------------
    // 1. عرض رسالة ترحيب JSON إذا لم يتم إرسال رابط
    // ----------------------------------------------------------------
    if (!link) {
        return res.json({ 
            status: 'ready', 
            message: 'KOBY Downloader API is running!',
            usage: 'الرجاء إرسال الرابط باستخدام بارامتر url=...',
            example: `https://koby-api.vercel.app/?url=INSTAGRAM_LINK_HERE`
        });
    }

    // ----------------------------------------------------------------
    // 2. معالجة الرابط وعرض النتيجة JSON الخام
    // ----------------------------------------------------------------
    try {
        const result = await processInstagramLink(link); 
        
        // 🚨 هذا هو الأمر المطلوب: إرسال النتيجة كـ JSON خام
        res.json(result); 

    } catch (error) {
        console.error('Processing error:', error);
        // إرسال رسالة خطأ كـ JSON
        res.status(500).json({ status: 'error', message: 'فشل الخادم في معالجة طلب المكتبة.', details: error.message });
    }
});

// 🚨 تصدير التطبيق كوحدة نمطية (Module) للعمل على Vercel
module.exports = app; 
