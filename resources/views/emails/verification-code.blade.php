<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
        }
        .content {
            text-align: center;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .code-container {
            background-color: #f9fafb;
            border: 2px dashed #4f46e5;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .code {
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #4f46e5;
            font-family: 'Courier New', monospace;
        }
        .expiration {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
        }
        .help-text {
            font-size: 14px;
            color: #999;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GameCMS.su</div>
        </div>
        <div class="content">
            <div class="greeting">Hello!</div>
            <div class="message">
                You have requested to sign in to your GameCMS.su account.
                <br><br>
                Your verification code is:
            </div>
            <div class="code-container">
                <div class="code">{{ $code }}</div>
            </div>
            <div class="expiration">
                This code will expire in <strong>10 minutes</strong>.
            </div>
            <div class="help-text">
                If you didn't request this code, you can safely ignore this email.
                <br><br>
                For security reasons, this code will expire in 10 minutes and can only be used once.
                <br><br>
                This is an automated message from GameCMS.su - please do not reply to this email.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} GameCMS.su. All rights reserved.
        </div>
    </div>
</body>
</html>
