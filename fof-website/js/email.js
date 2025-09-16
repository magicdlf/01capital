// 邮件发送功能
// 使用 EmailJS 服务发送邮件

// EmailJS 配置
const EMAILJS_SERVICE_ID = 'service_alzfhf8';
const EMAILJS_TEMPLATE_ID = 'template_kem12pn';
const EMAILJS_PUBLIC_KEY = 'NudKPCV0CbLl3NrZT';

// 初始化 EmailJS
function initEmailJS() {
    // 检查 EmailJS 是否已加载
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS is not loaded. Please include the EmailJS script.');
        return false;
    }
    
    // 初始化 EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    return true;
}

// 发送邮件函数
async function sendEmail(formData) {
    try {
        // 检查 EmailJS 是否初始化
        if (!initEmailJS()) {
            throw new Error('EmailJS not initialized');
        }

        // 准备邮件模板参数
        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_email: '01primelabs@gmail.com', // 您的接收邮箱
            subject: `New inquiry from ${formData.name} - 01 Capital Website`,
            current_date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            })
        };

        // 发送邮件
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('Email sent successfully:', response);
        return { success: true, message: 'Email sent successfully!' };
        
    } catch (error) {
        console.error('Error sending email:', error);
        return { 
            success: false, 
            message: 'Failed to send email. Please try again or contact us directly.' 
        };
    }
}

// 备用方案：使用 Formspree 或其他邮件服务
async function sendEmailViaFormspree(formData) {
    try {
        const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                message: formData.message,
                _subject: `New inquiry from ${formData.name} - 01 Capital Website`
            })
        });

        if (response.ok) {
            return { success: true, message: 'Email sent successfully!' };
        } else {
            throw new Error('Formspree request failed');
        }
    } catch (error) {
        console.error('Formspree error:', error);
        return { 
            success: false, 
            message: 'Failed to send email. Please try again or contact us directly.' 
        };
    }
}

// 主要的邮件发送函数（会尝试多种方法）
async function submitContactForm() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // 验证表单
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // 显示加载状态
    const submitBtn = document.querySelector('#contactModal .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = { name, email, message };
    let result = null;

    try {
        // 首先尝试 EmailJS
        if (EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
            result = await sendEmail(formData);
        } else {
            // 如果 EmailJS 未配置，尝试 Formspree
            result = await sendEmailViaFormspree(formData);
        }
    } catch (error) {
        console.error('All email methods failed:', error);
        result = { 
            success: false, 
            message: 'Failed to send email. Please contact us directly at 01primelabs@gmail.com' 
        };
    }

    // 恢复按钮状态
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // 显示结果
    if (result.success) {
        alert('Thank you for your inquiry! We will get back to you soon.');
        // 清空表单
        document.getElementById('contactForm').reset();
        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        if (modal) {
            modal.hide();
        }
    } else {
        alert(result.message);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果 EmailJS 已配置，初始化它
    if (EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
        initEmailJS();
    }
});
